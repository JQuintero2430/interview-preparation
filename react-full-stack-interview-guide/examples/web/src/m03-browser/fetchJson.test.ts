import { delay, http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { fetchJson, HttpError, TimeoutError } from './fetchJson';

const BASE = 'https://api.test';
const server = setupServer();

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('returns parsed JSON on 2xx', async () => {
  server.use(http.get(`${BASE}/user`, () => HttpResponse.json({ id: 7 })));
  await expect(fetchJson<{ id: number }>(`${BASE}/user`)).resolves.toEqual({ id: 7 });
});

test('forwards RequestInit (method, headers, body)', async () => {
  server.use(
    http.post(`${BASE}/echo`, async ({ request }) =>
      HttpResponse.json({ method: request.method, ct: request.headers.get('content-type'), body: await request.json() }),
    ),
  );
  const result = await fetchJson(`${BASE}/echo`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ a: 1 }),
  });
  expect(result).toEqual({ method: 'POST', ct: 'application/json', body: { a: 1 } });
});

test('a 500 is an HttpError carrying the status and body (fetch alone would resolve)', async () => {
  server.use(http.get(`${BASE}/boom`, () => new HttpResponse('nope', { status: 500 })));
  const error = await fetchJson(`${BASE}/boom`).catch((e: unknown) => e);
  expect(error).toBeInstanceOf(HttpError);
  expect(error).toMatchObject({ status: 500, body: 'nope' });
});

test('rejects with TimeoutError when the server is slower than the deadline', async () => {
  server.use(
    http.get(`${BASE}/slow`, async () => {
      await delay(300);
      return HttpResponse.json({});
    }),
  );
  await expect(fetchJson(`${BASE}/slow`, { timeoutMs: 30 })).rejects.toBeInstanceOf(TimeoutError);
});

test('a caller abort rejects with an AbortError, NOT a TimeoutError', async () => {
  server.use(
    http.get(`${BASE}/slow`, async () => {
      await delay(300);
      return HttpResponse.json({});
    }),
  );
  const controller = new AbortController();
  const promise = fetchJson(`${BASE}/slow`, { signal: controller.signal, timeoutMs: 5000 });
  setTimeout(() => controller.abort(), 10);

  const error = await promise.catch((e: unknown) => e);
  expect(error).not.toBeInstanceOf(TimeoutError);
  expect(error).toMatchObject({ name: 'AbortError' });
});

test('an already-aborted signal rejects without waiting', async () => {
  server.use(http.get(`${BASE}/user`, () => HttpResponse.json({ id: 1 })));
  const controller = new AbortController();
  controller.abort();
  await expect(fetchJson(`${BASE}/user`, { signal: controller.signal })).rejects.toMatchObject({
    name: 'AbortError',
  });
});
