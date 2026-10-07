// Section 3 claims: each narrowing form, the truthiness trap, predicates and assertion functions, closures, `this`.
import { diagnosticCodes, typecheck } from './typecheck';

describe('Module 06 · section 3', () => {
  it('Section 3: typeof "object" does not exclude null (TS18047)', () => {
    expect(
      diagnosticCodes("export function count(value: string[] | null) { if (typeof value === 'object') { return value.length; } return 0; }"),
    ).toEqual([18047]);
  });

  it('Section 3: in, instanceof and equality narrow a union', () => {
    expect(
      diagnosticCodes(`type Cat = { meow(): void }; type Dog = { bark(): void };
export function speak(pet: Cat | Dog) { if ('meow' in pet) { pet.meow(); } else { pet.bark(); } }
export function stamp(value: Date | string) { return value instanceof Date ? value.getTime() : value.length; }
export function same(a: string | number, b: string | boolean) { if (a === b) { return a.toUpperCase(); } return ''; }`),
    ).toEqual([]);
  });

  it('Section 3: instanceof needs a value that exists at run time, so an interface cannot be used with it (TS2693)', () => {
    expect(diagnosticCodes("interface User { name: string }\nexport const isUser = (value: unknown) => value instanceof User;")).toEqual([2693]);
    expect(diagnosticCodes("class User { name = '' }\nexport const isUser = (value: unknown) => value instanceof User;")).toEqual([]);
  });

  it('Section 3: an assignment narrows a declared union to the assigned type, and branches merge back into the union', () => {
    const code = `declare const flag: boolean;
export function f() {
  let v: string | number = 'a';
  const afterAssignment: number = v;
  if (flag) { v = 5; }
  const afterJoin: number = v;
}`;
    // The message starts with the type the checker found at that place.
    expect(typecheck(code).map(({ line, message }) => `line ${line}: ${/^Type '[^']*'/.exec(message)?.[0]}`)).toEqual([
      "line 4: Type 'string'",
      "line 6: Type 'string | number'",
    ]);
  });

  it('Section 3: truthiness narrowing compiles but treats 0 like undefined', () => {
    const label = (count: number | undefined): string => (count ? `${count} items` : 'no count');
    expect([label(0), label(undefined), label(2)]).toEqual(['no count', 'no count', '2 items']);
    expect(diagnosticCodes('export const label = (count: number | undefined): string => (count ? `${count} items` : "no count");')).toEqual([]);
  });

  it('Section 3: the compiler trusts a type predicate, even one that lies', () => {
    expect(
      diagnosticCodes(`function isString(value: unknown): value is string { return typeof value === 'number'; }
export const shout = (value: unknown) => (isString(value) ? value.toUpperCase() : '');`),
    ).toEqual([]);
  });

  it('Section 3: an assertion function narrows after the call, but only when its name has an explicit type (TS2775)', () => {
    const declared = 'function assertDefined<T>(value: T): asserts value is NonNullable<T> { if (value == null) throw new Error("missing"); }';
    const inferred = 'const assertDefined = <T,>(value: T): asserts value is NonNullable<T> => { if (value == null) throw new Error("missing"); };';
    const use = '\nexport function size(text: string | undefined) { assertDefined(text); return text.length; }';
    expect(diagnosticCodes(declared + use)).toEqual([]);
    expect(diagnosticCodes(inferred + use)).toEqual([2775, 18048]);
  });

  it('Section 3: a closure keeps the narrowing of a let only if it is not assigned again later (TS18048)', () => {
    const body = (after: string) =>
      `export function lengths(input: string | undefined) { let value = input; if (value) { const result = [1].map(() => value.length); ${after} return result; } return []; }`;
    expect(diagnosticCodes(body(''))).toEqual([]);
    expect(diagnosticCodes(body('value = undefined;'))).toEqual([18048]);
  });

  it('Section 3: filter infers a type predicate from x !== undefined, but not from a truthiness test (TS2322)', () => {
    expect(diagnosticCodes('export const present: number[] = [1, undefined].filter((x) => x !== undefined);')).toEqual([]);
    expect(diagnosticCodes('export const present: number[] = [1, undefined].filter((x) => !!x);')).toEqual([2322]);
  });

  it('Section 3: a this parameter is checked at the call (TS2684), and an untyped this is an error under strict (TS2683)', () => {
    expect(diagnosticCodes('interface Counter { count: number }\nfunction increment(this: Counter) { this.count++; }\nincrement();')).toEqual([2684]);
    expect(diagnosticCodes('export function read() { return this.value; }')).toEqual([2683]);
  });

  it('Section 3: the isUser predicate from the section compiles, and its checks reject bad data', () => {
    const isUserSource = `interface User { name: string; age: number }
export function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' && value !== null &&
    'name' in value && typeof value.name === 'string' &&
    'age' in value && typeof value.age === 'number'
  );
}`;
    expect(diagnosticCodes(isUserSource)).toEqual([]);
    const isUser = (value: unknown): boolean =>
      typeof value === 'object' &&
      value !== null &&
      'name' in value &&
      typeof value.name === 'string' &&
      'age' in value &&
      typeof value.age === 'number';
    expect([isUser({ name: 'Ada', age: 36 }), isUser(null), isUser({ name: 'Ada' }), isUser({ name: 1, age: 2 })]).toEqual([
      true,
      false,
      false,
      false,
    ]);
  });
});
