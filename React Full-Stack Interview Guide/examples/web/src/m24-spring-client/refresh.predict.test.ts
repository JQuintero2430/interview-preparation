import { delay, http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { API_ORIGIN } from './contract';
import { createApiClient } from './http';
import { createSession } from './session';
import { problem } from './testServer';

// PREDICT THE OUTPUT. Two requests are sent at the same moment with an expired token ("old").
// The API answers 401 to "old", and 200 to "fresh". POST /auth/refresh takes 50 ms and returns "fresh".
// Before reading the assertions, write down: (1) the order of requests the server sees,
// (2) how many refreshes happen with single-flight, (3) how many without it, (4) what each caller gets.

const log: string[] = [];
const server = setupServer(
  http.get(`${API_ORIGIN}/api/projects/:id`, async ({ request, params }) => {
    const id = String(params['id']);
    log.push(`GET ${id} ${request.headers.get('authorization')}`);
    await delay(10);
    return request.headers.get('authorization') === 'Bearer fresh'
      ? HttpResponse.json({ id: Number(id), name: `Project ${id}` })
      : problem(401, { title: 'Unauthorized', status: 401 });
  }),
  http.post(`${API_ORIGIN}/auth/refresh`, async () => {
    log.push('POST refresh');
    await delay(50);
    return HttpResponse.json({ accessToken: 'fresh' });
  }),
);

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
beforeEach(() => {
  log.length = 0;
});
afterAll(() => server.close());

async function fireTwo(singleFlight: boolean) {
  const session = createSession(API_ORIGIN);
  session.setAccessToken('old');
  const client = createApiClient({ baseUrl: API_ORIGIN, auth: session, singleFlight });
  return Promise.all([client.request<{ name: string }>('/api/projects/1'), client.request<{ name: string }>('/api/projects/2')]);
}

// Two concurrent requests have no guaranteed arrival order (verified by running it: the single-flight
// run logged GET 1 first, the herd run logged GET 2 first, on every run). So each concurrent group is
// compared as a sorted set: [first attempts] → [refreshes] → [retries].
const phases = (entries: string[]) => [entries.slice(0, 2).sort(), entries.slice(2, -2), entries.slice(-2).sort()];

test('single-flight: both 401s share ONE refresh, then both retry with the new token', async () => {
  const results = await fireTwo(true);

  expect(phases(log)).toEqual([
    ['GET 1 Bearer old', 'GET 2 Bearer old'],
    ['POST refresh'],
    ['GET 1 Bearer fresh', 'GET 2 Bearer fresh'],
  ]);
  expect(results.map((r) => r.name)).toEqual(['Project 1', 'Project 2']);
});

test('without single-flight: the herd refreshes twice (with rotation, the second would invalidate the first)', async () => {
  const results = await fireTwo(false);

  expect(phases(log)).toEqual([
    ['GET 1 Bearer old', 'GET 2 Bearer old'],
    ['POST refresh', 'POST refresh'],
    ['GET 1 Bearer fresh', 'GET 2 Bearer fresh'],
  ]);
  expect(results.map((r) => r.name)).toEqual(['Project 1', 'Project 2']);
});
