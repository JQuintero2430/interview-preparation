import { looseEquals, toPrimitiveDefault } from './loose-equals';

type Outcome = boolean | string;

// Runs a comparison and reports either its result or the name of the error it threw.
function outcome(compare: () => boolean): Outcome {
  try {
    return compare();
  } catch (error) {
    return error instanceof Error ? error.name : 'non-error thrown';
  }
}

const sharedObject = {};
const sym = Symbol('s');

// Values chosen to hit every step of IsLooselyEqual at least once.
const MATRIX: readonly unknown[] = [
  undefined, null, true, false,
  0, -0, 1, 1.5, NaN, Infinity,
  '', '0', '1', ' 1 ', '1.5', 'abc', '1,2', '0x10', '[object Object]',
  0n, 1n, 16n,
  sym,
  [], [0], [1], [1, 2],
  sharedObject, {},
  { valueOf: () => 1, toString: () => 'two' },
  { [Symbol.toPrimitive]: () => '1' },
  new Date(0),
  () => 1,
  Object.create(null),
];

describe('E01.2 looseEquals: the == algorithm by hand', () => {
  it('same-type comparisons behave like ===', () => {
    expect(looseEquals(NaN, NaN)).toBe(false);
    expect(looseEquals(0, -0)).toBe(true);
    expect(looseEquals(sharedObject, sharedObject)).toBe(true);
    expect(looseEquals({}, {})).toBe(false);
    expect(looseEquals([], [])).toBe(false);
    expect(looseEquals(sym, sym)).toBe(true);
  });

  it('null and undefined are loosely equal only to each other', () => {
    expect(looseEquals(null, undefined)).toBe(true);
    expect(looseEquals(undefined, null)).toBe(true);
    expect(looseEquals(null, 0)).toBe(false);
    expect(looseEquals(undefined, '')).toBe(false);
    expect(looseEquals(null, false)).toBe(false);
  });

  it('numbers, strings and booleans are compared through ToNumber', () => {
    expect(looseEquals('', 0)).toBe(true);
    expect(looseEquals(' 1 ', 1)).toBe(true);
    expect(looseEquals('0x10', 16)).toBe(true);
    expect(looseEquals('0', false)).toBe(true);
    expect(looseEquals('abc', NaN)).toBe(false);
    expect(looseEquals(true, '1')).toBe(true);
  });

  it('BigInt compares with strings via StringToBigInt and with numbers mathematically', () => {
    expect(looseEquals(1n, '1')).toBe(true);
    expect(looseEquals(0n, '')).toBe(true);
    expect(looseEquals(1n, '1.5')).toBe(false);
    expect(looseEquals(16n, '0x10')).toBe(true);
    expect(looseEquals(1n, 1)).toBe(true);
    expect(looseEquals(1n, 1.5)).toBe(false);
    expect(looseEquals(0n, NaN)).toBe(false);
    expect(looseEquals(1n, Infinity)).toBe(false);
  });

  it('objects go through ToPrimitive with the default hint, or throw TypeError', () => {
    const hints: string[] = [];
    const probe = {
      [Symbol.toPrimitive](hint: string): number {
        hints.push(hint);
        return 1;
      },
    };
    expect(looseEquals(probe, 1)).toBe(true);
    expect(hints).toEqual(['default']);
    expect(toPrimitiveDefault({ valueOf: () => 1, toString: () => 'two' })).toBe(1);
    expect(toPrimitiveDefault([1, 2])).toBe('1,2');
    expect(toPrimitiveDefault(new Date(0))).toBe(String(new Date(0)));
    expect(() => looseEquals(Object.create(null), 1)).toThrow(TypeError);
    expect(() => looseEquals({ [Symbol.toPrimitive]: () => ({}) }, 1)).toThrow(TypeError);
  });

  it('agrees with == on every pair of the matrix', () => {
    const mismatches: string[] = [];
    MATRIX.forEach((x, i) => {
      MATRIX.forEach((y, j) => {
        const expected = outcome(() => x == y);
        const actual = outcome(() => looseEquals(x, y));
        if (expected !== actual) mismatches.push(`[${i}] vs [${j}]: == gave ${expected}, looseEquals gave ${actual}`);
      });
    });
    expect(mismatches).toEqual([]);
  });
});
