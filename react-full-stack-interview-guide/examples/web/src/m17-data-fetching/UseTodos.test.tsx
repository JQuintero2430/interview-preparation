import { act, render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { API } from './api';
import { clearTodosPromiseCache, UseTodos } from './UseTodos';

let requests = 0;
// The response waits for the test to release it, so the fallback is still showing when the test checks it.
// (A fixed `delay(20)` raced the awaited act under full-suite load.)
let gate: Promise<void>;
let release: () => void;

const server = setupServer(
  http.get(`${API}/todos`, async () => {
    requests += 1;
    await gate;
    return HttpResponse.json([{ id: '1', title: 'Learn use()', done: false }]);
  }),
);

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
beforeEach(() => {
  requests = 0;
  gate = new Promise((resolve) => (release = resolve));
  clearTodosPromiseCache();
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// React 19 does not retry a component that suspended inside a sync `act` (RTL's plain `render`);
// it logs "A component suspended inside an `act` scope, but the `act` call was not awaited".
// So the first render goes through an awaited async act.
const renderSuspending = () => act(async () => render(<UseTodos />));

test('use(promise) suspends to the fallback, then renders the data', async () => {
  await renderSuspending();

  expect(screen.getByRole('status')).toHaveTextContent('Loading todos…');
  release();
  expect(await screen.findByText('Learn use()')).toBeInTheDocument();
});

test('the cached promise means re-renders do not refetch', async () => {
  const { rerender } = await renderSuspending();
  release();
  await screen.findByText('Learn use()');

  rerender(<UseTodos />);
  rerender(<UseTodos />);

  expect(screen.getByText('Learn use()')).toBeInTheDocument();
  expect(requests).toBe(1);
});
