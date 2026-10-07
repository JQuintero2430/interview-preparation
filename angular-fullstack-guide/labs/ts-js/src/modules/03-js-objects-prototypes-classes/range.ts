// labs/ts-js/src/modules/03-js-objects-prototypes-classes/range.ts
// Exercise 03.3: a reusable iterable and a lazy chunking generator.

const DEFAULT_STEP = 1;

/** A lazy, reusable numeric range over [start, end) with a positive step. */
export class Range implements Iterable<number> {
  readonly start: number;
  readonly end: number;
  readonly step: number;

  /**
   * @param start first value produced
   * @param end exclusive upper bound
   * @param step positive increment; anything else throws a RangeError
   */
  constructor(start: number, end: number, step = DEFAULT_STEP) {
    if (!(step > 0)) throw new RangeError(`step must be a positive number, got ${step}`);
    this.start = start;
    this.end = end;
    this.step = step;
  }

  // A generator method returns a fresh iterator per call, which is what makes the range reusable.
  *[Symbol.iterator](): Generator<number, void, undefined> {
    for (let n = this.start; n < this.end; n += this.step) yield n;
  }
}

/**
 * Lazily groups `source` into arrays of `size` items; the last chunk may be shorter.
 * Validates eagerly: an invalid size throws when `chunk` is called, not on the first `next()`.
 * Stopping early (break, return, take) closes the source iterator too.
 */
export function chunk<T>(source: Iterable<T>, size: number): Generator<T[], void, undefined> {
  if (!Number.isInteger(size) || size < 1) throw new RangeError(`size must be a positive integer, got ${size}`);
  return chunkGenerator(source, size);
}

// Kept separate because a generator body does not run until the first next(),
// so validation inside it would be deferred.
function* chunkGenerator<T>(source: Iterable<T>, size: number): Generator<T[], void, undefined> {
  let batch: T[] = [];
  for (const item of source) {
    batch.push(item);
    if (batch.length === size) {
      yield batch;
      batch = [];
    }
  }
  if (batch.length > 0) yield batch;
}
