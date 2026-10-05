/**
 * Memoize a pure function. The cache key defaults to JSON.stringify(args),
 * which is fine for primitives and plain data but is WRONG for: functions,
 * undefined inside arrays (becomes null), Maps/Sets, cycles, and objects whose
 * key order differs. Pass `keyFn` for those. The cache is unbounded: see LRUCache.
 */
export function memoize<A extends unknown[], R>(
  fn: (...args: A) => R,
  keyFn: (...args: A) => unknown = (...args) => JSON.stringify(args),
): ((...args: A) => R) & { cache: Map<unknown, R> } {
  const cache = new Map<unknown, R>();

  const memoized = (...args: A): R => {
    const key = keyFn(...args);
    if (cache.has(key)) return cache.get(key) as R; // has(), not `get() !== undefined`: results may be falsy
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
  memoized.cache = cache;
  return memoized;
}
