import { backoffDelay, retry } from './retry';

/** An operation that fails `failures` times, then fulfils with 'ok'. Records each call. */
function flakyOperation(failures: number) {
  const calls: { attempt: number; signal: AbortSignal | undefined }[] = [];
  const operation = async (attempt: number, signal?: AbortSignal): Promise<string> => {
    calls.push({ attempt, signal });
    if (calls.length <= failures) throw new Error(`failure ${calls.length}`);
    return 'ok';
  };
  return { operation, calls };
}

describe('E04.3 retry with backoff', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('fulfils with the first successful result after transient failures', async () => {
    const { operation, calls } = flakyOperation(2);
    const result = retry(operation, { retries: 3, baseDelayMs: 100 });
    await vi.advanceTimersByTimeAsync(300);
    expect(await result).toBe('ok');
    expect(calls.map((call) => call.attempt)).toEqual([0, 1, 2]);
  });

  it('waits base * factor^n between attempts', async () => {
    const { operation, calls } = flakyOperation(2);
    const result = retry(operation, { retries: 3, baseDelayMs: 100, factor: 3 });
    await vi.advanceTimersByTimeAsync(99);
    expect(calls).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(1); // 100 ms: first retry
    expect(calls).toHaveLength(2);
    await vi.advanceTimersByTimeAsync(299);
    expect(calls).toHaveLength(2);
    await vi.advanceTimersByTimeAsync(1); // 300 ms more: second retry
    expect(calls).toHaveLength(3);
    expect(await result).toBe('ok');
  });

  it('caps each wait at maxDelayMs', () => {
    expect([0, 1, 2, 3].map((attempt) => backoffDelay(attempt, 100, 2, 250))).toEqual([100, 200, 250, 250]);
  });

  it('rejects with the last error when the retries run out', async () => {
    const { operation, calls } = flakyOperation(10);
    const outcome = retry(operation, { retries: 2, baseDelayMs: 10 }).catch((error: unknown) => error);
    await vi.advanceTimersByTimeAsync(1_000);
    expect(await outcome).toEqual(new Error('failure 3'));
    expect(calls).toHaveLength(3);
  });

  it('rethrows immediately, without waiting, when shouldRetry returns false', async () => {
    const { operation, calls } = flakyOperation(10);
    const outcome = retry(operation, { retries: 5, baseDelayMs: 10, shouldRetry: () => false }).catch(
      (error: unknown) => error,
    );
    expect(await outcome).toEqual(new Error('failure 1'));
    expect(calls).toHaveLength(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('rejects with signal.reason when aborted during a wait, and makes no further attempts', async () => {
    const { operation, calls } = flakyOperation(10);
    const controller = new AbortController();
    const outcome = retry(operation, { retries: 5, baseDelayMs: 1_000, signal: controller.signal }).catch(
      (error: unknown) => error,
    );
    await vi.advanceTimersByTimeAsync(500); // inside the first 1 s wait
    const reason = new Error('cancelled by user');
    controller.abort(reason);
    expect(await outcome).toBe(reason);
    await vi.advanceTimersByTimeAsync(10_000);
    expect(calls).toHaveLength(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('never calls the operation when the signal is already aborted', async () => {
    const { operation, calls } = flakyOperation(0);
    const signal = AbortSignal.abort(new Error('already gone'));
    await expect(retry(operation, { retries: 3, baseDelayMs: 10, signal })).rejects.toThrow('already gone');
    expect(calls).toHaveLength(0);
  });

  it('passes the attempt number and the signal to the operation', async () => {
    const { operation, calls } = flakyOperation(1);
    const controller = new AbortController();
    const result = retry(operation, { retries: 1, baseDelayMs: 10, signal: controller.signal });
    await vi.advanceTimersByTimeAsync(10);
    await result;
    expect(calls).toEqual([
      { attempt: 0, signal: controller.signal },
      { attempt: 1, signal: controller.signal },
    ]);
  });
});
