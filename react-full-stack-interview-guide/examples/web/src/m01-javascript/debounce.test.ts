import { debounce } from './debounce';

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

test('fires once, after the quiet period, with the last arguments', () => {
  const fn = vi.fn();
  const d = debounce(fn, 100);
  d('a');
  vi.advanceTimersByTime(50);
  d('b');
  vi.advanceTimersByTime(99);
  expect(fn).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1);
  expect(fn).toHaveBeenCalledTimes(1);
  expect(fn).toHaveBeenCalledWith('b');
});

test('each call restarts the wait', () => {
  const fn = vi.fn();
  const d = debounce(fn, 100);
  for (let i = 0; i < 5; i++) {
    d(i);
    vi.advanceTimersByTime(90);
  }
  expect(fn).not.toHaveBeenCalled();
  vi.advanceTimersByTime(10);
  expect(fn).toHaveBeenCalledTimes(1);
  expect(fn).toHaveBeenCalledWith(4);
});

test('cancel drops the pending call', () => {
  const fn = vi.fn();
  const d = debounce(fn, 100);
  d('x');
  d.cancel();
  vi.advanceTimersByTime(1000);
  expect(fn).not.toHaveBeenCalled();
});

test('flush runs the pending call immediately, once', () => {
  const fn = vi.fn();
  const d = debounce(fn, 100);
  d('x');
  d.flush();
  expect(fn).toHaveBeenCalledTimes(1);
  vi.advanceTimersByTime(1000);
  expect(fn).toHaveBeenCalledTimes(1);
  d.flush(); // nothing pending: no-op
  expect(fn).toHaveBeenCalledTimes(1);
});

test('a call after the wait starts a new cycle', () => {
  const fn = vi.fn();
  const d = debounce(fn, 100);
  d(1);
  vi.advanceTimersByTime(100);
  d(2);
  vi.advanceTimersByTime(100);
  expect(fn.mock.calls).toEqual([[1], [2]]);
});
