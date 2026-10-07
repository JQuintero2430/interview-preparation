import { memoize } from './memoize';

describe('E02.1 memoize', () => {
  it('computes each distinct key once and serves repeats from the cache', () => {
    const seen: number[] = [];
    const square = memoize((n: number) => {
      seen.push(n);
      return n * n;
    });

    expect([square(3), square(3), square(4), square(3)]).toEqual([9, 9, 16, 9]);
    expect(seen).toEqual([3, 4]);
  });

  it('uses the first argument as the default key, compared with SameValueZero', () => {
    let runs = 0;
    const label = memoize((n: number) => {
      runs++;
      return `value ${n}`;
    });

    label(Number.NaN);
    label(Number.NaN);
    label(0);
    label(-0);

    expect(runs).toBe(2); // NaN matches NaN, and 0 matches -0
  });

  it('caches an undefined result, so it is computed only once', () => {
    let calls = 0;
    const lookup = memoize((_id: string): string | undefined => {
      calls += 1;
      return undefined;
    });

    expect([lookup('missing'), lookup('missing')]).toEqual([undefined, undefined]);
    expect(calls).toBe(1);
  });

  it('accepts a custom key function for functions of several arguments', () => {
    let runs = 0;
    const add = memoize(
      (a: number, b: number) => {
        runs++;
        return a + b;
      },
      (a, b) => `${a},${b}`,
    );

    expect([add(1, 2), add(1, 3), add(1, 2)]).toEqual([3, 4, 3]);
    expect(runs).toBe(2);
  });

  it('forwards the caller\'s this to the original function', () => {
    const pricing = {
      rate: 3,
      price: memoize(function (this: { rate: number }, units: number) {
        return units * this.rate;
      }),
    };

    expect(pricing.price(2)).toBe(6);
  });

  it('keeps one cache per memoized function, and clear() empties it', () => {
    let runs = 0;
    const work = (n: number) => {
      runs++;
      return n;
    };
    const first = memoize(work);
    const second = memoize(work);

    first(1);
    second(1); // a separate closure, so a separate cache
    expect(runs).toBe(2);

    first.clear();
    first(1);
    expect(runs).toBe(3);
  });

  it('caches nothing when the function throws, so the next call retries', () => {
    let attempts = 0;
    const flaky = memoize((n: number) => {
      attempts++;
      if (attempts === 1) {
        throw new Error('first attempt fails');
      }
      return n;
    });

    expect(() => flaky(7)).toThrow('first attempt fails');
    expect(flaky(7)).toBe(7);
    expect(attempts).toBe(2);
  });
});
