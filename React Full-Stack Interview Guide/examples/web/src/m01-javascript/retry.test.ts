import { retry } from './retry';

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

/** A task that fails `failures` times, then succeeds; records the elapsed time of every attempt. */
function flaky(failures: number) {
  const start = Date.now();
  const attemptTimes: number[] = [];
  const task = (attempt: number): Promise<string> => {
    attemptTimes.push(Date.now() - start);
    return attempt <= failures ? Promise.reject(new Error(`fail ${attempt}`)) : Promise.resolve('ok');
  };
  return { task, attemptTimes };
}

test('succeeds immediately without waiting', async () => {
  const { task, attemptTimes } = flaky(0);
  expect(await retry(task, { retries: 3, baseDelayMs: 100 })).toBe('ok');
  expect(attemptTimes).toEqual([0]);
});

test('backs off exponentially: 100, 200, 400', async () => {
  const { task, attemptTimes } = flaky(3);
  const p = retry(task, { retries: 5, baseDelayMs: 100 });
  await vi.advanceTimersByTimeAsync(700);
  expect(await p).toBe('ok');
  expect(attemptTimes).toEqual([0, 100, 300, 700]);
});

test('maxDelayMs caps the delay', async () => {
  const { task, attemptTimes } = flaky(3);
  const p = retry(task, { retries: 5, baseDelayMs: 100, maxDelayMs: 150 });
  await vi.advanceTimersByTimeAsync(400);
  await p;
  expect(attemptTimes).toEqual([0, 100, 250, 400]);
});

test('jitter maps the delay', async () => {
  const { task, attemptTimes } = flaky(2);
  const p = retry(task, { retries: 5, baseDelayMs: 100, jitter: (d) => d / 2 });
  await vi.advanceTimersByTimeAsync(150);
  await p;
  expect(attemptTimes).toEqual([0, 50, 150]);
});

test('rejects with the LAST error once retries are exhausted', async () => {
  const { task, attemptTimes } = flaky(Infinity);
  const p = retry(task, { retries: 2, baseDelayMs: 10 });
  const assertion = expect(p).rejects.toThrow('fail 3');
  await vi.advanceTimersByTimeAsync(1000);
  await assertion;
  expect(attemptTimes).toHaveLength(3);
});

test('shouldRetry=false fails fast', async () => {
  const { task, attemptTimes } = flaky(Infinity);
  await expect(retry(task, { retries: 5, baseDelayMs: 10, shouldRetry: () => false })).rejects.toThrow('fail 1');
  expect(attemptTimes).toHaveLength(1);
});

test('an AbortSignal cancels the wait between attempts', async () => {
  const { task, attemptTimes } = flaky(Infinity);
  const controller = new AbortController();
  const p = retry(task, { retries: 5, baseDelayMs: 1000, signal: controller.signal });
  const assertion = expect(p).rejects.toThrow('stop');
  await vi.advanceTimersByTimeAsync(10); // attempt 1 failed, now sleeping
  controller.abort(new Error('stop'));
  await assertion;
  expect(attemptTimes).toHaveLength(1);
});
