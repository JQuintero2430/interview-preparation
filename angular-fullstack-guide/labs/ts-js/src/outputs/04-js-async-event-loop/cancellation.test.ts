// Output question for module 04, section 7 (AbortController / AbortSignal).
import { captureLogs } from '../capture';

// Q04.26 code: the race-with-cleanup variant for work that cannot take a signal.
async function raceWithTimeout<T>(work: Promise<T>, ms: number): Promise<T> {
  let id: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    id = setTimeout(() => reject(new Error('timeout')), ms);
  });
  try {
    return await Promise.race([work, timeout]);
  } finally {
    clearTimeout(id); // nothing stays scheduled after success or failure
  }
}

describe('04 · cancellation', () => {
  it('Q04.25 abort() fires synchronously, only once, with a default AbortError reason', async () => {
    const lines = await captureLogs((log) => {
      const controller = new AbortController();
      controller.signal.addEventListener('abort', () => log('abort event', controller.signal.reason.name));
      log('before', controller.signal.aborted);
      controller.abort();
      log('after', controller.signal.aborted);
      controller.abort(new Error('again'));
      log('reason', controller.signal.reason.name);
      const combined = AbortSignal.any([new AbortController().signal, AbortSignal.abort('stop')]);
      log('any', combined.aborted, combined.reason);
    });
    expect(lines).toEqual(['before false', 'abort event AbortError', 'after true', 'reason AbortError', 'any true stop']);
  });

  it('Q04.26 raceWithTimeout settles with the work or the timeout and leaves no timer behind', async () => {
    vi.useFakeTimers();
    try {
      await expect(raceWithTimeout(Promise.resolve('fast'), 10_000)).resolves.toBe('fast');
      expect(vi.getTimerCount()).toBe(0);

      const slow = new Promise<string>((resolve) => setTimeout(() => resolve('slow'), 200));
      const raced = expect(raceWithTimeout(slow, 20)).rejects.toThrow('timeout');
      await vi.advanceTimersByTimeAsync(20);
      await raced;
      expect(vi.getTimerCount()).toBe(1); // only the slow work's own timer: it keeps running
    } finally {
      vi.useRealTimers();
    }
  });

  it('Exercise 04.1: Node timers/promises setTimeout rejects with an AbortError whose code is ABORT_ERR', async () => {
    const timersSpecifier = 'node:timers/promises';
    const { setTimeout: sleep } = (await import(timersSpecifier)) as {
      setTimeout(ms: number, value: unknown, options: { signal: AbortSignal }): Promise<unknown>;
    };
    const controller = new AbortController();
    const waiting = sleep(10_000, undefined, { signal: controller.signal });
    controller.abort();
    await expect(waiting).rejects.toMatchObject({ name: 'AbortError', code: 'ABORT_ERR' });
  });
});
