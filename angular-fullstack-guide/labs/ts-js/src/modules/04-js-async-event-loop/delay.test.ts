import { delay } from './delay';

describe('E04.1 delay', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('resolves only after the given number of milliseconds', async () => {
    let done = false;
    const pending = delay(100).then(() => {
      done = true;
    });
    await vi.advanceTimersByTimeAsync(99);
    expect(done).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    await pending;
    expect(done).toBe(true);
  });

  it('rejects with signal.reason when aborted while waiting, and clears its timer', async () => {
    const controller = new AbortController();
    const outcome = delay(1_000, controller.signal).catch((error: unknown) => error);
    const reason = new Error('user left the page');
    controller.abort(reason);
    expect(await outcome).toBe(reason);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('rejects immediately, without scheduling a timer, when the signal is already aborted', async () => {
    const signal = AbortSignal.abort('too late');
    const outcome = delay(1_000, signal).catch((error: unknown) => error);
    expect(vi.getTimerCount()).toBe(0);
    expect(await outcome).toBe('too late');
  });

  it('removes its abort listener when it resolves normally', async () => {
    const controller = new AbortController();
    const removeSpy = vi.spyOn(controller.signal, 'removeEventListener');
    const pending = delay(10, controller.signal);
    await vi.advanceTimersByTimeAsync(10);
    await pending;
    expect(removeSpy).toHaveBeenCalledWith('abort', expect.any(Function));
  });

  it('rejects with a RangeError for a negative or non-finite duration', async () => {
    await expect(delay(-1)).rejects.toBeInstanceOf(RangeError);
    await expect(delay(Number.NaN)).rejects.toBeInstanceOf(RangeError);
  });
});
