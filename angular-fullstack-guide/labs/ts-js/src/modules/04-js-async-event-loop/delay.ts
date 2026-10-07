// labs/ts-js/src/modules/04-js-async-event-loop/delay.ts
// Exercise 04.1: an abortable sleep. The building block for retries, polling and timeouts.

/**
 * Resolves after `ms` milliseconds, or rejects with `signal.reason` as soon as the signal aborts.
 * It never leaves a timer or an abort listener behind, whichever way it settles.
 */
export function delay(ms: number, signal?: AbortSignal): Promise<void> {
  if (!Number.isFinite(ms) || ms < 0) {
    return Promise.reject(new RangeError(`delay: ms must be a finite number >= 0, got ${ms}`));
  }
  if (signal?.aborted) {
    return Promise.reject(signal.reason);
  }
  return new Promise<void>((resolve, reject) => {
    const onAbort = (): void => {
      clearTimeout(timer);
      reject(signal?.reason);
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}
