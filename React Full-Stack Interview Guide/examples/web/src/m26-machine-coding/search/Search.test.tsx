import { act, fireEvent, render, screen } from '@testing-library/react';
import { Search } from './Search';

// Fake timers + fireEvent + act(): `userEvent` with advanceTimers hangs in this repo unless
// shouldAdvanceTime is set, and fireEvent keeps every step explicit.
beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

type Call = { query: string; signal: AbortSignal; resolve: (items: string[]) => void; reject: () => void };

function setup() {
  const calls: Call[] = [];
  const search = vi.fn(
    (query: string, signal: AbortSignal) =>
      new Promise<string[]>((resolve, reject) => {
        calls.push({ query, signal, resolve, reject: () => reject(new Error('boom')) });
      }),
  );
  render(<Search search={search} delayMs={300} />);
  const box = screen.getByRole('textbox', { name: 'Search' });
  const type = (value: string) => fireEvent.change(box, { target: { value } });
  const wait = (ms: number) =>
    act(() => {
      vi.advanceTimersByTime(ms);
    });
  const call = (query: string) => {
    const found = calls.find((c) => c.query === query);
    if (!found) throw new Error(`no request for "${query}"`);
    return found;
  };
  return { search, type, wait, call };
}

test('typing quickly sends one request, only after the quiet period', async () => {
  const { search, type, wait } = setup();
  type('r');
  type('re');
  type('react');

  wait(299);
  expect(search).not.toHaveBeenCalled();
  wait(1);
  expect(search).toHaveBeenCalledTimes(1);
  expect(search).toHaveBeenCalledWith('react', expect.any(AbortSignal));
});

test('shows a loading state, then the results', async () => {
  const { type, wait, call } = setup();
  type('react');
  wait(300);
  expect(screen.getByRole('status')).toHaveTextContent('Searching');

  await act(async () => {
    call('react').resolve(['React hooks', 'React Router']);
  });
  expect(screen.getByText('React hooks')).toBeInTheDocument();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});

test('a slow answer to an old query never overwrites the newer one, and the old request is aborted', async () => {
  const { type, wait, call } = setup();
  type('a');
  wait(300);
  type('ab');
  wait(300);
  expect(call('a').signal.aborted).toBe(true);

  await act(async () => call('ab').resolve(['AB result']));
  await act(async () => call('a').resolve(['A result (stale)']));

  expect(screen.getByText('AB result')).toBeInTheDocument();
  expect(screen.queryByText('A result (stale)')).not.toBeInTheDocument();
});

test('shows an empty state and an error state', async () => {
  const { type, wait, call } = setup();
  type('zzz');
  wait(300);
  await act(async () => call('zzz').resolve([]));
  expect(screen.getByText('No results')).toBeInTheDocument();

  type('boom');
  wait(300);
  await act(async () => call('boom').reject());
  expect(screen.getByRole('alert')).toHaveTextContent('Search failed');
});

test('clearing the box sends no request and hides old results', async () => {
  const { search, type, wait, call } = setup();
  type('react');
  wait(300);
  await act(async () => call('react').resolve(['React hooks']));

  type('');
  wait(300);
  expect(search).toHaveBeenCalledTimes(1);
  expect(screen.queryByText('React hooks')).not.toBeInTheDocument();
});
