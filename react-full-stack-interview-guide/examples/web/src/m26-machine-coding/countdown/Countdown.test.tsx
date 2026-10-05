import { act, fireEvent, render, screen } from '@testing-library/react';
import { Countdown, formatTime } from './Countdown';

// Vitest's fake timers also fake Date, so advanceTimersByTime moves Date.now() too.
// fireEvent + act() keeps every step explicit (userEvent + advanceTimers can hang here).
beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

const advance = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });
const click = (name: string) => fireEvent.click(screen.getByRole('button', { name }));
const timer = () => screen.getByRole('timer');

test('formatTime pads minutes and seconds', () => {
  expect(formatTime(0)).toBe('00:00');
  expect(formatTime(65)).toBe('01:05');
  expect(formatTime(600)).toBe('10:00');
});

test('shows the full time and does not tick before Start', () => {
  render(<Countdown seconds={90} />);
  expect(timer()).toHaveTextContent('01:30');
  advance(5000);
  expect(timer()).toHaveTextContent('01:30');
  expect(vi.getTimerCount()).toBe(0);
});

test('counts down on the second boundary, not before', () => {
  render(<Countdown seconds={3} />);
  click('Start');

  advance(750);
  expect(timer()).toHaveTextContent('00:03');
  advance(250);
  expect(timer()).toHaveTextContent('00:02');
});

test('a late tick (throttled tab) catches up: time comes from the clock, not from counting ticks', () => {
  render(<Countdown seconds={10} />);
  click('Start');
  vi.setSystemTime(Date.now() + 7000); // the clock jumps 7s but no timer has fired yet
  advance(250); // the next tick computes from the clock; counting ticks would show 00:10 or 00:09
  expect(timer()).toHaveTextContent('00:03');
});

test('finishes at zero, announces it and stops the interval', () => {
  render(<Countdown seconds={3} />);
  click('Start');
  advance(3000);

  expect(timer()).toHaveTextContent('00:00');
  expect(screen.getByRole('status')).toHaveTextContent("Time's up!");
  expect(vi.getTimerCount()).toBe(0);
  expect(screen.getByRole('button', { name: 'Start' })).toBeDisabled();
});

test('Pause keeps the remaining time and Start resumes from it', () => {
  render(<Countdown seconds={3} />);
  click('Start');
  advance(1000);

  click('Pause');
  expect(timer()).toHaveTextContent('00:02');
  advance(5000);
  expect(timer()).toHaveTextContent('00:02');

  click('Start');
  advance(2000);
  expect(timer()).toHaveTextContent('00:00');
});

test('Reset goes back to the start and can run again', () => {
  render(<Countdown seconds={3} />);
  click('Start');
  advance(3000);

  click('Reset');
  expect(timer()).toHaveTextContent('00:03');
  expect(screen.getByRole('button', { name: 'Start' })).toBeEnabled();
});

test('unmounting clears the interval', () => {
  const { unmount } = render(<Countdown seconds={3} />);
  click('Start');
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});
