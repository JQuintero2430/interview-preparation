import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { CacheProbe, PROBE_KEY, PROBE_URL, probeLog } from './CacheProbe';
import { renderWithClient } from './testUtils';

// PREDICT-THE-OUTPUT. Each test states a prediction (request count and the sequence of
// `status/fetchStatus` pairs). Every expected value below was confirmed by running the test.
let requests = 0;

const server = setupServer(
  http.get(PROBE_URL, async () => {
    requests += 1;
    await delay(30);
    return HttpResponse.json({ version: requests });
  }),
);

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
beforeEach(() => {
  requests = 0;
  probeLog.length = 0;
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('A. staleTime 0: mount → unmount → remount (cache still alive)', async () => {
  const { rerender } = renderWithClient(<CacheProbe staleTime={0} />);
  await screen.findByText('version 1');

  rerender(<></>);
  rerender(<CacheProbe staleTime={0} />);
  expect(screen.getByText('version 1')).toBeInTheDocument(); // cached data, shown at once
  await screen.findByText('version 2'); // ...and refetched in the background

  expect(requests).toBe(2);
  expect(probeLog).toEqual(['pending/fetching', 'success/idle', 'success/fetching', 'success/idle']);
});

test('B. staleTime 30 s: mount → unmount → remount within the window', async () => {
  const { rerender } = renderWithClient(<CacheProbe staleTime={30_000} />);
  await screen.findByText('version 1');

  rerender(<></>);
  rerender(<CacheProbe staleTime={30_000} />);
  await new Promise((r) => setTimeout(r, 100)); // time for a refetch that should not happen

  expect(screen.getByText('version 1')).toBeInTheDocument();
  expect(requests).toBe(1);
  expect(probeLog).toEqual(['pending/fetching', 'success/idle']);
});

test('C. two components with the same key mount together', async () => {
  renderWithClient(
    <>
      <CacheProbe />
      <CacheProbe />
    </>,
  );
  await waitFor(() => expect(screen.getAllByText('version 1')).toHaveLength(2));

  expect(requests).toBe(1);
});

test('D. a manual refetch on success data', async () => {
  const user = userEvent.setup();
  renderWithClient(<CacheProbe staleTime={30_000} />);
  await screen.findByText('version 1');

  await user.click(screen.getByRole('button', { name: 'Refetch' }));
  await screen.findByText('version 2');

  expect(requests).toBe(2);
  expect(probeLog).toEqual(['pending/fetching', 'success/idle', 'success/fetching', 'success/idle']);
});

test('E. gcTime 0: unmount, let GC run, remount', async () => {
  const { rerender, client } = renderWithClient(<CacheProbe gcTime={0} />);
  await screen.findByText('version 1');

  rerender(<></>);
  await waitFor(() => expect(client.getQueryData(PROBE_KEY)).toBeUndefined()); // collected
  rerender(<CacheProbe gcTime={0} />);
  expect(screen.getByText('no data')).toBeInTheDocument(); // a hard loading state again
  await screen.findByText('version 2');

  expect(requests).toBe(2);
  expect(probeLog).toEqual(['pending/fetching', 'success/idle', 'pending/fetching', 'success/idle']);
});
