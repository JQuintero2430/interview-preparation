import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DebouncedSearch } from './DebouncedSearch';
import { useDebounce } from './useDebounce';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));

test('returns the initial value immediately', () => {
  const { result } = renderHook(() => useDebounce('a', 300));
  expect(result.current).toBe('a');
});

test('each change restarts the timer; only the last value lands, delayMs after it', () => {
  const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
    initialProps: { value: 'a' },
  });

  rerender({ value: 'ab' }); // t = 0
  advance(200); //              t = 200: still waiting
  rerender({ value: 'abc' }); // restarts the 300 ms window
  advance(200); //              t = 400: 'ab' was cancelled, 'abc' not due until t = 500
  expect(result.current).toBe('a');

  advance(99); //               t = 499
  expect(result.current).toBe('a');
  advance(1); //                t = 500
  expect(result.current).toBe('abc');
});

test('clears its pending timer on unmount', () => {
  const { rerender, unmount } = renderHook(({ value }) => useDebounce(value, 300), {
    initialProps: { value: 'a' },
  });
  rerender({ value: 'b' });
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});

test('through a component: typing is instant, the debounced text waits for a pause', async () => {
  // RTL's asyncWrapper (which user-event runs through) awaits a setTimeout(0) and only advances it
  // when a `jest` global exists. Under Vitest it doesn't, so without shouldAdvanceTime this hangs.
  vi.useFakeTimers({ shouldAdvanceTime: true });
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  render(<DebouncedSearch delayMs={300} />);

  await user.type(screen.getByLabelText('Search'), 'abc');
  expect(screen.getByLabelText('Search')).toHaveValue('abc');
  expect(screen.getByText('Searching for: (nothing yet)')).toBeInTheDocument();

  advance(300);
  expect(screen.getByText('Searching for: abc')).toBeInTheDocument();
});
