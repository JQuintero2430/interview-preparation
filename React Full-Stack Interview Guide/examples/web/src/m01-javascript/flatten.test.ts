import { flatten, flattenIterative, type Nested } from './flatten';

const cases: Array<[string, Nested<number>[], number | undefined]> = [
  ['already flat', [1, 2, 3], undefined],
  ['one level', [1, [2, 3]], undefined],
  ['deep', [1, [2, [3, [4, [5]]]]], undefined],
  ['empty inner arrays', [[], [[]], 1], undefined],
  ['depth 1', [1, [2, [3, [4]]]], 1],
  ['depth 0', [1, [2]], 0],
];

describe.each(cases)('%s', (_name, input, depth) => {
  test('flatten matches Array.prototype.flat', () => {
    expect(flatten(input, depth)).toEqual((input as unknown[]).flat(depth ?? Infinity));
  });
  test('flattenIterative matches too', () => {
    expect(flattenIterative(input, depth)).toEqual((input as unknown[]).flat(depth ?? Infinity));
  });
});

test('the iterative version survives nesting that is too deep to recurse', () => {
  let deep: Nested<number> = 1;
  for (let i = 0; i < 50_000; i++) deep = [deep];
  expect(flattenIterative([deep as Nested<number>])).toEqual([1]);
});

test('preserves order and non-numeric leaves', () => {
  expect(flatten<string | null>(['a', [null, ['b']], 'c'])).toEqual(['a', null, 'b', 'c']);
});
