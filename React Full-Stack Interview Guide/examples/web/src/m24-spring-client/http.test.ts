import { delay, http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { API_ORIGIN } from './contract';
import { createApiClient } from './http';
import { ApiError } from './problem';
import { createSession } from './session';
import { problem, springApiHandlers } from './testServer';

const server = setupServer(...springApiHandlers());

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
beforeEach(() => server.use(...springApiHandlers()));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function newClient(onSignedOut = () => {}) {
  const session = createSession(API_ORIGIN, onSignedOut);
  return { session, client: createApiClient({ baseUrl: API_ORIGIN, auth: session }) };
}

test('a 404 problem+json becomes an ApiError carrying the problem', async () => {
  const { client } = newClient();

  await expect(client.request('/api/projects/9999')).rejects.toMatchObject({
    name: 'ApiError',
    status: 404,
    problem: { type: 'https://example.com/problems/project-not-found', title: 'Project not found', instance: '/api/projects/9999' },
  });
});

test('a success is parsed and an empty 204 body is allowed', async () => {
  server.use(http.post(`${API_ORIGIN}/api/ping`, () => new HttpResponse(null, { status: 204 })));
  const { client } = newClient();

  await expect(client.request('/api/projects/1')).resolves.toEqual({ id: 1, name: 'Project 01' });
  await expect(client.request('/api/ping', { method: 'POST' })).resolves.toBeUndefined();
});

describe('401 handling', () => {
  let refreshCalls: number;
  let getCalls: number;

  beforeEach(() => {
    refreshCalls = 0;
    getCalls = 0;
  });

  function useAuthServer({ refreshOk, freshAccepted }: { refreshOk: boolean; freshAccepted: boolean }) {
    server.use(
      http.get(`${API_ORIGIN}/api/secure`, ({ request }) => {
        getCalls++;
        const ok = freshAccepted && request.headers.get('authorization') === 'Bearer fresh';
        return ok ? HttpResponse.json({ ok: true }) : problem(401, { title: 'Unauthorized', status: 401 });
      }),
      http.post(`${API_ORIGIN}/auth/refresh`, () => {
        refreshCalls++;
        return refreshOk ? HttpResponse.json({ accessToken: 'fresh' }) : new HttpResponse(null, { status: 401 });
      }),
    );
  }

  test('refreshes once, retries once and succeeds', async () => {
    useAuthServer({ refreshOk: true, freshAccepted: true });
    const { client, session } = newClient();
    session.setAccessToken('old');

    await expect(client.request('/api/secure')).resolves.toEqual({ ok: true });
    expect([getCalls, refreshCalls]).toEqual([2, 1]);
    expect(session.getAccessToken()).toBe('fresh');
  });

  test('a failed refresh signs out and surfaces the original 401', async () => {
    useAuthServer({ refreshOk: false, freshAccepted: true });
    const onSignedOut = vi.fn();
    const { client, session } = newClient(onSignedOut);
    session.setAccessToken('old');

    await expect(client.request('/api/secure')).rejects.toMatchObject({ status: 401 });
    expect(onSignedOut).toHaveBeenCalledTimes(1);
    expect(session.getAccessToken()).toBeNull();
    expect(getCalls).toBe(1); // no retry without a new token
  });

  test('a 401 after a successful refresh is final: no loop', async () => {
    useAuthServer({ refreshOk: true, freshAccepted: false });
    const onSignedOut = vi.fn();
    const { client, session } = newClient(onSignedOut);
    session.setAccessToken('old');

    const error: unknown = await client.request('/api/secure').catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect([getCalls, refreshCalls]).toEqual([2, 1]);
    expect(onSignedOut).toHaveBeenCalledTimes(1);
  });

  test('a request that 401s after someone else refreshed reuses the new token', async () => {
    server.use(
      http.get(`${API_ORIGIN}/api/slow/:id`, async ({ request, params }) => {
        await delay(params['id'] === '1' ? 10 : 150);
        return request.headers.get('authorization') === 'Bearer fresh' ? HttpResponse.json({ ok: true }) : problem(401, { status: 401 });
      }),
      http.post(`${API_ORIGIN}/auth/refresh`, async () => {
        refreshCalls++;
        await delay(30);
        return HttpResponse.json({ accessToken: 'fresh' });
      }),
    );
    const { client, session } = newClient();
    session.setAccessToken('old');

    await Promise.all([client.request('/api/slow/1'), client.request('/api/slow/2')]);

    expect(refreshCalls).toBe(1); // the second 401 arrived after the refresh finished
  });
});
