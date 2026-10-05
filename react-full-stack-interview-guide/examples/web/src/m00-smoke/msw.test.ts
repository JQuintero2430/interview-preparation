import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(http.get('https://api.test/ping', () => HttpResponse.json({ ok: true })));

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterAll(() => server.close());

test('MSW intercepts fetch in the test environment', async () => {
  const res = await fetch('https://api.test/ping');
  expect(await res.json()).toEqual({ ok: true });
});
