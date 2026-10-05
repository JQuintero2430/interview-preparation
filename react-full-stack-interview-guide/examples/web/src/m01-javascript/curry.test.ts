import { curry } from './curry';

const add3 = (a: number, b: number, c: number) => a + b + c;

test('curries one argument at a time', () => {
  const curried = curry(add3);
  expect(curried(1)(2)(3)).toBe(6);
});

test('also accepts several arguments per call at runtime', () => {
  // A callable that returns another callable, so the chained calls below type-check.
  interface Loose {
    (...args: number[]): Loose;
  }
  const loose = curry(add3) as unknown as Loose;
  expect(loose(1, 2, 3)).toBe(6);
  expect(loose(1, 2)(3)).toBe(6);
  expect(loose(1)(2, 3)).toBe(6);
});

test('partial applications are independent', () => {
  const addOne = curry(add3)(1);
  const addOneTwo = addOne(2);
  expect(addOneTwo(3)).toBe(6);
  expect(addOneTwo(10)).toBe(13);
  expect(addOne(5)(5)).toBe(11);
});

test('arity comes from fn.length: defaults and rest are not counted', () => {
  const withDefault = (a: number, b = 10) => a + b;
  expect(withDefault.length).toBe(1);
  const c = curry(withDefault) as unknown as (a: number) => number;
  expect(c(1)).toBe(11); // b is never collected
});
