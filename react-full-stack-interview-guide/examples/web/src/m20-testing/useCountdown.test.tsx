import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CountdownTimer } from './CountdownTimer';
import { useCountdown } from './useCountdown';

// Always hand the real clock back, even when a test fails half-way.
afterEach(() => vi.useRealTimers());

// act() flushes the state updates the fired timers cause, so the next assertion sees them.
const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));

describe('the hook alone: plain fake timers, exact boundaries', () => {
  beforeEach(() => vi.useFakeTimers());

  test('nothing happens until start()', () => {
    const { result } = renderHook(() => useCountdown(3));
    advance(5000);
    expect(result.current).toMatchObject({ remaining: 3, running: false, done: false });
    expect(vi.getTimerCount()).toBe(0);
  });

  test('ticks exactly on the interval boundary, not before', () => {
    const { result } = renderHook(() => useCountdown(3));
    act(() => result.current.start());

    advance(999);
    expect(result.current.remaining).toBe(3);
    advance(1);
    expect(result.current.remaining).toBe(2);
  });

  test('stops at 0 and removes its interval', () => {
    const { result } = renderHook(() => useCountdown(3));
    act(() => result.current.start());

    advance(3000);
    expect(result.current).toMatchObject({ remaining: 0, running: false, done: true });
    expect(vi.getTimerCount()).toBe(0);

    advance(5000);
    expect(result.current.remaining).toBe(0);
  });

  test('pause keeps the remaining time; start resumes; reset goes back to the start', () => {
    const { result } = renderHook(() => useCountdown(3));
    act(() => result.current.start());
    advance(1000);

    act(() => result.current.pause());
    advance(5000);
    expect(result.current).toMatchObject({ remaining: 2, running: false });

    act(() => result.current.start());
    advance(1000);
    expect(result.current.remaining).toBe(1);

    act(() => result.current.reset());
    expect(result.current).toMatchObject({ remaining: 3, running: false, done: false });
  });

  test('unmount clears the interval', () => {
    const { result, unmount } = renderHook(() => useCountdown(3));
    act(() => result.current.start());
    expect(vi.getTimerCount()).toBe(1);

    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('the component with user-event: the Vitest recipe', () => {
  test('shouldAdvanceTime + advanceTimers: clicks resolve, then we jump the clock', async () => {
    // Plain vi.useFakeTimers() would hang on the first await user.click(): RTL's asyncWrapper waits on
    // a setTimeout(0) that it only advances when a `jest` global exists. shouldAdvanceTime lets the
    // fake clock follow real time, so that timeout fires.
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<CountdownTimer seconds={3} />);

    await user.click(screen.getByRole('button', { name: 'Start' }));
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();

    // No exact-boundary assertions here: real time also moves the fake clock a little.
    advance(3000);
    expect(screen.getByRole('timer')).toHaveTextContent('0s');
    expect(screen.getByRole('status')).toHaveTextContent("Time's up!");
    expect(screen.getByRole('button', { name: 'Start' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByRole('timer')).toHaveTextContent('3s');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
