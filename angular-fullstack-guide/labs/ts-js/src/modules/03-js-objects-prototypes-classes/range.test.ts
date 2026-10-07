import { chunk, Range } from './range';

function* naturals(): Generator<number, void, undefined> {
  for (let n = 1; ; n++) yield n;
}

describe('E03.3 Range and chunk', () => {
  it('Range yields values from start (inclusive) to end (exclusive) by step', () => {
    expect([...new Range(0, 10, 3)]).toEqual([0, 3, 6, 9]);
    expect([...new Range(1, 4)]).toEqual([1, 2, 3]);
  });

  it('Range is reusable: every iteration starts over', () => {
    const range = new Range(1, 4);
    expect([...range]).toEqual([1, 2, 3]);
    expect([...range]).toEqual([1, 2, 3]);
  });

  it('Range is empty when start >= end', () => {
    expect([...new Range(5, 5)]).toEqual([]);
    expect([...new Range(6, 1)]).toEqual([]);
  });

  it('Range rejects a non-positive or NaN step at construction', () => {
    expect(() => new Range(0, 5, 0)).toThrow(RangeError);
    expect(() => new Range(0, 5, -1)).toThrow(RangeError);
    expect(() => new Range(0, 5, Number.NaN)).toThrow(RangeError);
  });

  it('chunk groups items and keeps a shorter last chunk', () => {
    expect([...chunk(new Range(1, 8), 3)]).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
    expect([...chunk([], 2)]).toEqual([]);
  });

  it('chunk is lazy: it works on an infinite source', () => {
    expect(chunk(naturals(), 2).take(2).toArray()).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  it('stopping early closes the source iterator', () => {
    let closed = false;
    function* source(): Generator<number, void, undefined> {
      try {
        yield* naturals();
      } finally {
        closed = true;
      }
    }
    for (const batch of chunk(source(), 2)) {
      if (batch[0] === 3) break;
    }
    expect(closed).toBe(true);
  });

  it('an invalid size throws when chunk is called, not on the first next()', () => {
    expect(() => chunk([1, 2], 0)).toThrow(RangeError);
    expect(() => chunk([1, 2], 1.5)).toThrow(RangeError);
  });
});
