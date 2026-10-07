// labs/ts-js/src/modules/02-js-scope-closures-this/rate-limit.ts
// Exercise 02.3: debounce and throttle. Both keep their timer and pending call in a closure.

type TimerId = ReturnType<typeof setTimeout>;

/** A rate-limited function: same call signature, plus a way to drop what is pending. */
export type RateLimited<T, A extends unknown[]> = ((this: T, ...args: A) => void) & {
  /** Drops any pending call and resets the timer. */
  cancel(): void;
};

interface PendingCall<T, A> {
  readonly self: T;
  readonly args: A;
}

/**
 * Delays `fn` until `waitMs` have passed without another call (trailing edge only).
 *
 * @param fn     the function to run; it receives the `this` and arguments of the LAST call
 * @param waitMs the quiet period, in milliseconds, that must follow the last call
 * @returns the debounced function, with `cancel()`
 */
export function debounce<T, A extends unknown[]>(
  fn: (this: T, ...args: A) => void,
  waitMs: number,
): RateLimited<T, A> {
  let timer: TimerId | undefined;

  function debounced(this: T, ...args: A): void {
    clearTimeout(timer);
    // An arrow function, so that `this` inside the timer callback is the caller's `this`.
    timer = setTimeout(() => {
      timer = undefined;
      fn.apply(this, args);
    }, waitMs);
  }

  const cancel = (): void => {
    clearTimeout(timer);
    timer = undefined;
  };

  return Object.assign(debounced, { cancel });
}

/**
 * Runs `fn` at most once per `intervalMs`: immediately on the first call (leading edge), then
 * once more at the end of the interval with the latest arguments if calls arrived meanwhile
 * (trailing edge). A trailing run starts a new interval.
 *
 * @param fn         the function to run
 * @param intervalMs the minimum time, in milliseconds, between two runs
 * @returns the throttled function, with `cancel()`
 */
export function throttle<T, A extends unknown[]>(
  fn: (this: T, ...args: A) => void,
  intervalMs: number,
): RateLimited<T, A> {
  let timer: TimerId | undefined;
  let pending: PendingCall<T, A> | undefined;

  const startInterval = (): void => {
    timer = setTimeout(() => {
      timer = undefined;
      if (pending === undefined) {
        return;
      }
      const { self, args } = pending;
      pending = undefined;
      fn.apply(self, args);
      startInterval();
    }, intervalMs);
  };

  function throttled(this: T, ...args: A): void {
    if (timer !== undefined) {
      pending = { self: this, args };
      return;
    }
    fn.apply(this, args);
    startInterval();
  }

  const cancel = (): void => {
    clearTimeout(timer);
    timer = undefined;
    pending = undefined;
  };

  return Object.assign(throttled, { cancel });
}
