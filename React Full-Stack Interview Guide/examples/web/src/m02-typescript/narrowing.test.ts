import { expectTypeOf } from 'vitest';
import {
  area,
  assertIsDefined,
  describeError,
  formatId,
  isString,
  keepPresent,
  perimeter,
  type Shape,
} from './narrowing';

describe('narrowing (runtime)', () => {
  const circle: Shape = { kind: 'circle', radius: 1 };
  const rect: Shape = { kind: 'rect', width: 2, height: 3 };

  it('area and perimeter handle each member', () => {
    expect(area(circle)).toBeCloseTo(Math.PI);
    expect(area(rect)).toBe(6);
    expect(perimeter(rect)).toBe(10);
  });

  it('formatId narrows with typeof', () => {
    expect(formatId(42)).toBe('000042');
    expect(formatId('  ab ')).toBe('ab');
  });

  it('describeError reads Error, error-shaped objects and anything else', () => {
    expect(describeError(new Error('boom'))).toBe('boom');
    expect(describeError({ message: 'shaped' })).toBe('shaped');
    expect(describeError(404)).toBe('404');
  });

  it('assertIsDefined throws on null and undefined, not on falsy values', () => {
    expect(() => assertIsDefined(null)).toThrow('Expected a value');
    expect(() => assertIsDefined(undefined, 'custom')).toThrow('custom');
    expect(() => assertIsDefined(0)).not.toThrow();
  });

  it('keepPresent drops null and undefined only', () => {
    expect(keepPresent([0, null, 1, undefined, 2])).toEqual([0, 1, 2]);
  });
});

describe('narrowing (compile-time, checked by tsc)', () => {
  it('type predicates and assertion functions narrow', () => {
    const value: unknown = 'x';
    if (isString(value)) expectTypeOf(value).toEqualTypeOf<string>();

    const maybe = 'abc' as string | undefined;
    assertIsDefined(maybe);
    expectTypeOf(maybe).toEqualTypeOf<string>();
  });

  it('filter with a null check narrows (inferred type predicate, TS 5.5+)', () => {
    const mixed = [1, null, 2];
    expectTypeOf(mixed.filter((x) => x !== null)).toEqualTypeOf<number[]>();
  });

  it('filter with a truthiness check does NOT narrow: 0 would be dropped, so no predicate is inferred', () => {
    const mixed = [1, null, 2];
    expectTypeOf(mixed.filter((x) => !!x)).toEqualTypeOf<(number | null)[]>();
  });

  it('a switch that has not narrowed to never will not satisfy never', () => {
    const shape = { kind: 'circle', radius: 1 } as Shape;
    // @ts-expect-error - shape is still the whole union, not never
    const impossible: never = shape;
    expect(impossible).toBeDefined();
  });
});
