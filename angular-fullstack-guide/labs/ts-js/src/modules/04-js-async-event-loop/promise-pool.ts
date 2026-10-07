// labs/ts-js/src/modules/04-js-async-event-loop/promise-pool.ts
// Exercise 04.2: map over items with at most `limit` operations in flight at once.

/**
 * Applies `mapper` to every item, running at most `limit` calls concurrently.
 * A new call starts as soon as any running call settles (a pool, not fixed batches).
 * Resolves with the results in input order. Rejects with the first error, and stops
 * starting new items after it (calls already in flight are not cancelled).
 */
export async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new RangeError(`mapWithConcurrency: limit must be an integer >= 1, got ${limit}`);
  }
  const results = new Array<R>(items.length);
  let nextIndex = 0;
  let failed = false;

  // Each worker pulls the next index from a shared cursor. JavaScript runs one callback at a
  // time, so `nextIndex++` needs no lock: no other worker can interleave inside the statement.
  async function worker(): Promise<void> {
    while (!failed && nextIndex < items.length) {
      const index = nextIndex++;
      try {
        results[index] = await mapper(items[index] as T, index);
      } catch (error) {
        failed = true;
        throw error;
      }
    }
  }

  const workerCount = Math.min(limit, items.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return results;
}
