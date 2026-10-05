import { throttle } from './throttle';

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

test('first call runs immediately, the burst collapses to one trailing call', () => {
  const fn = vi.fn();
  const t = throttle(fn, 100);
  t(1);
  expect(fn).toHaveBeenCalledTimes(1);
  vi.advanceTimersByTime(10);
  t(2);
  vi.advanceTimersByTime(10);
  t(3);
  expect(fn).toHaveBeenCalledTimes(1);
  vi.advanceTimersByTime(80);
  expect(fn.mock.calls).toEqual([[1], [3]]);
  vi.advanceTimersByTime(1000);
  expect(fn.mock.calls).toEqual([[1], [3]]);
});

test('a single call produces no trailing call', () => {
  const fn = vi.fn();
  const t = throttle(fn, 100);
  t('only');
  vi.advanceTimersByTime(1000);
  expect(fn).toHaveBeenCalledTimes(1);
});

test('a steady stream runs at most once per window', () => {
  const fn = vi.fn();
  const t = throttle(fn, 100);
  for (let ms = 0; ms < 1000; ms += 10) {
    t(ms);
    vi.advanceTimersByTime(10);
  }
  expect(fn.mock.calls.length).toBeLessThanOrEqual(11);
  expect(fn.mock.calls.length).toBeGreaterThanOrEqual(9);
});

test('after the window is quiet, the next call is leading again', () => {
  const fn = vi.fn();
  const t = throttle(fn, 100);
  t('a');
  vi.advanceTimersByTime(200);
  t('b');
  expect(fn.mock.calls).toEqual([['a'], ['b']]);
});

test('cancel drops the trailing call', () => {
  const fn = vi.fn();
  const t = throttle(fn, 100);
  t(1);
  t(2);
  t.cancel();
  vi.advanceTimersByTime(1000);
  expect(fn.mock.calls).toEqual([[1]]);
});
