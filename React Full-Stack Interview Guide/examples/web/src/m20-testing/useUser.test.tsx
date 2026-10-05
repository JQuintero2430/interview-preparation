import { renderHook, waitFor } from '@testing-library/react';
import { useUser } from './useUser';
import { createTestQueryClient, createWrapper } from './test-utils/render';
import { ada, alan, server } from './test-utils/server';

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('renderHook + wrapper: pending first, then the data', async () => {
  const { result } = renderHook(() => useUser('1'), { wrapper: createWrapper() });

  expect(result.current.isPending).toBe(true);
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toEqual(ada);
});

test('an HTTP error surfaces as error state with the message', async () => {
  const { result } = renderHook(() => useUser('404'), { wrapper: createWrapper() });

  await waitFor(() => expect(result.current.isError).toBe(true));
  expect(result.current.error?.message).toBe('HTTP 404');
});

test('rerender with new props switches to the new key', async () => {
  const { result, rerender } = renderHook(({ id }) => useUser(id), {
    wrapper: createWrapper(),
    initialProps: { id: '1' },
  });
  await waitFor(() => expect(result.current.data).toEqual(ada));

  rerender({ id: '2' });
  await waitFor(() => expect(result.current.data).toEqual(alan));
});

test('result.current is a live getter: a copy taken early stays stale', async () => {
  const { result } = renderHook(() => useUser('1'), { wrapper: createWrapper() });
  const early = result.current;

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(early.isPending).toBe(true);
  expect(result.current.isPending).toBe(false);
});

test('pass your own client to seed or inspect the cache', async () => {
  const queryClient = createTestQueryClient();
  const { result } = renderHook(() => useUser('2'), { wrapper: createWrapper(queryClient) });

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(queryClient.getQueryData(['user', '2'])).toEqual(alan);
});
