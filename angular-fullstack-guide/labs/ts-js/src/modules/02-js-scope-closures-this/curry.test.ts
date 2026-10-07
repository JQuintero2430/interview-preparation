import { curry, partial } from './curry';

const volume = (length: number, width: number, height: number): number => length * width * height;

describe('E02.2 curry', () => {
  it('turns an N-argument function into N one-argument calls, typed at every step', () => {
    const curried = curry(volume);
    const result: number = curried(2)(3)(4);

    expect(result).toBe(24);
    // @ts-expect-error each step accepts exactly the type of the matching parameter
    curried(2)('3');
  });

  it('does not call the original function until the last argument arrives', () => {
    const calls: number[][] = [];
    const curried = curry((a: number, b: number) => {
      calls.push([a, b]);
      return a + b;
    });

    const waiting = curried(1);
    expect(calls).toEqual([]);
    expect(waiting(2)).toBe(3);
    expect(calls).toEqual([[1, 2]]);
  });

  it('lets each partially applied step be reused independently', () => {
    const curried = curry(volume);
    const base = curried(2);
    const tall = base(3);

    expect(tall(10)).toBe(60);
    expect(base(5)(1)).toBe(10); // a second branch from the same step
    expect(tall(1)).toBe(6); // the first branch is unaffected
  });
});

describe('E02.2 partial', () => {
  it('fixes leading arguments now and takes the rest later, with typed rest parameters', () => {
    const withBase = partial(volume, 2, 3);

    expect(withBase(4)).toBe(24);
    expect(withBase(5)).toBe(30); // reusable
    // @ts-expect-error the remaining parameter is still a number
    withBase('4');
  });
});

describe('Section 6: function length', () => {
  it('counts only the parameters before the first default or rest parameter', () => {
    const withDefault = (a: number, b = 1): number => a + b;
    const withRest = (...values: number[]): number => values.length;

    expect(volume.length).toBe(3);
    expect(withDefault.length).toBe(1);
    expect(withRest.length).toBe(0);
  });
});
