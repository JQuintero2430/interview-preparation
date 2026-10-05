import { act, renderHook, waitFor } from '@testing-library/react';
import { delay, http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { useFetch } from './useFetch';

type User = { id: string; name: string; version: number };

const USERS_URL = 'https://api.example.test/users';
let hits = 0;

// User 1 answers SLOWLY and user 2 answers FAST, so a missing abort/derivation would let
// the stale user 1 response land last.
const server = setupServer(
  http.get(`${USERS_URL}/:id`, async ({ params }) => {
    const id = String(params.id);
    if (id === '404') return new HttpResponse(null, { status: 404 });
    hits += 1;
    await delay(id === '1' ? 150 : 10);
    const user: User = { id, name: `User ${id}`, version: hits };
    return HttpResponse.json(user);
  }),
);

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
beforeEach(() => {
  hits = 0;
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('a null url stays idle and sends nothing', () => {
  const { result } = renderHook(() => useFetch<User>(null));
  expect(result.current.status).toBe('idle');
  expect(hits).toBe(0);
});

test('loading, then success', async () => {
  const { result } = renderHook(() => useFetch<User>(`${USERS_URL}/2`));
  expect(result.current.status).toBe('loading');
  await waitFor(() => expect(result.current.status).toBe('success'));
  expect(result.current).toMatchObject({ data: { id: '2', name: 'User 2' } });
});

test('switching url quickly never shows the slower, stale response', async () => {
  const { result, rerender } = renderHook(({ url }) => useFetch<User>(url), {
    initialProps: { url: `${USERS_URL}/1` },
  });
  rerender({ url: `${USERS_URL}/2` });

  await waitFor(() => expect(result.current.status).toBe('success'));
  await new Promise((r) => setTimeout(r, 200)); // let the slow user 1 response (not) arrive
  expect(result.current).toMatchObject({ status: 'success', data: { id: '2' } });
});

test('an HTTP error becomes the error state', async () => {
  const { result } = renderHook(() => useFetch<User>(`${USERS_URL}/404`));
  await waitFor(() => expect(result.current).toMatchObject({ status: 'error', error: 'HTTP 404' }));
});

test('refetch goes back to loading and then shows the new response', async () => {
  const { result } = renderHook(() => useFetch<User>(`${USERS_URL}/2`));
  await waitFor(() => expect(result.current).toMatchObject({ data: { version: 1 } }));

  act(() => result.current.refetch());
  expect(result.current.status).toBe('loading');
  await waitFor(() => expect(result.current).toMatchObject({ data: { version: 2 } }));
});
