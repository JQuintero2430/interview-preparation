import { act, render, screen } from '@testing-library/react';
import { Ticker } from './Ticker';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));

test('counts once per interval (no stale closure freezing it at 1)', () => {
  render(<Ticker delayMs={1000} step={1} />);
  advance(3000);
  expect(screen.getByText('Count: 3')).toBeInTheDocument();
});

test('changing step takes effect on the next tick without resetting the interval phase', () => {
  const { rerender } = render(<Ticker delayMs={1000} step={1} />);
  advance(1500); // 1 tick, half-way to the next
  rerender(<Ticker delayMs={1000} step={10} />);
  advance(500); // the original interval fires at t=2000: proof it was not restarted
  expect(screen.getByText('Count: 11')).toBeInTheDocument();
});

test('clears the interval on unmount', () => {
  const { unmount } = render(<Ticker delayMs={1000} step={1} />);
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});
