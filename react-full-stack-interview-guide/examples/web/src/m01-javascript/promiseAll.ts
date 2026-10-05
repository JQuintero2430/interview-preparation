/**
 * A from-scratch Promise.all: resolves with results in INPUT order, rejects
 * with the first rejection, accepts plain values, and resolves [] for empty input.
 */
export function promiseAll<T>(values: Iterable<T | PromiseLike<T>>): Promise<Awaited<T>[]> {
  return new Promise((resolve, reject) => {
    const items = Array.from(values);
    const results: unknown[] = new Array<unknown>(items.length);
    let remaining = items.length;

    if (remaining === 0) {
      resolve([]);
      return;
    }

    items.forEach((item, index) => {
      Promise.resolve(item).then((value) => {
        results[index] = value; // by index, NOT push: completion order is arbitrary
        remaining -= 1;
        if (remaining === 0) resolve(results as Awaited<T>[]);
      }, reject);
    });
  });
}
