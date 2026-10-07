// labs/ts-js/src/modules/02-js-scope-closures-this/memoize.ts
// Exercise 02.1: a memoizer built on a closure. Each call to memoize() creates its own cache.

/** A memoized function: same signature as the original, plus a way to empty its cache. */
export type Memoized<T, A extends unknown[], R> = ((this: T, ...args: A) => R) & {
  /** Forgets every cached result. */
  clear(): void;
};

/**
 * Wraps `fn` so that each distinct key is computed once.
 *
 * @param fn    the function to cache; it receives the caller's `this` and arguments on a miss
 * @param keyOf derives the cache key from the arguments; defaults to the first argument.
 *              Keys are compared with SameValueZero (the `Map` rule), so `NaN` matches `NaN`.
 * @returns the memoized function. A call that throws caches nothing, so the next call retries.
 */
export function memoize<T, A extends unknown[], R>(
  fn: (this: T, ...args: A) => R,
  keyOf: (...args: A) => unknown = (...args) => args[0],
): Memoized<T, A, R> {
  const cache = new Map<unknown, R>();

  function memoized(this: T, ...args: A): R {
    const key = keyOf(...args);
    if (cache.has(key)) {
      return cache.get(key) as R;
    }
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  }

  return Object.assign(memoized, { clear: () => cache.clear() });
}
