// labs/ts-js/src/modules/04-js-async-event-loop/latest-only.ts
// Exercise 04.4: "only the latest call wins", the promise version of RxJS switchMap.

const SUPERSEDED_MESSAGE = 'Superseded by a newer call';

/**
 * Wraps an abortable async function. Each call aborts the previous call's signal, and the
 * previous call's promise rejects at once with that AbortError, so a stale result can never
 * be delivered, whether or not `fn` honours its signal.
 */
export function latestOnly<A extends unknown[], R>(
  fn: (signal: AbortSignal, ...args: A) => Promise<R>,
): (...args: A) => Promise<R> {
  let current: AbortController | undefined;

  return (...args: A): Promise<R> => {
    current?.abort(new DOMException(SUPERSEDED_MESSAGE, 'AbortError'));
    const controller = new AbortController();
    current = controller;
    const { signal } = controller;

    return new Promise<R>((resolve, reject) => {
      // A promise settles once: whichever comes first, the abort or fn's outcome, wins.
      signal.addEventListener('abort', () => reject(signal.reason), { once: true });
      fn(signal, ...args).then(resolve, reject);
    });
  };
}
