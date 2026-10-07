// Section 1 claims: what a type parameter relates, constraints, defaults, inference sites, const type parameters and NoInfer.
import { typecheck } from '../06-ts-type-system-essentials/typecheck';

const linesAndCodes = (code: string) => typecheck(code).map(({ line, code: diagnostic }) => `line ${line}: TS${diagnostic}`);
/**
 * Reads the type TypeScript gives `expression` from a TS2322 message. The expression goes through a `const` first,
 * because `const probe: never = call()` would make `never` a contextual return type and change the inference.
 */
const typeOf = (code: string, expression: string) =>
  typecheck(`${code}\nconst value = ${expression};\nconst probe: never = value;`)
    .find((diagnostic) => diagnostic.code === 2322)
    ?.message.match(/^Type '(.+?)' is not assignable to type 'never'/)?.[1];

const PLUCK = `export function pluck<T, K extends keyof T>(items: readonly T[], key: K): T[K][] {
  return items.map((item) => item[key]);
}
const users = [{ name: 'Ada', age: 36 }];`;

describe('Module 07 · section 1', () => {
  it('Section 1: any lets a wrong element type through, while a type parameter relates input and output (TS2322)', () => {
    expect(linesAndCodes("function firstAny(items: any[]) { return items[0]; }\nexport const n: number = firstAny(['a']);")).toEqual([]);
    expect(
      linesAndCodes(
        "function first<T>(items: readonly T[]): T | undefined { return items[0]; }\nexport const n: number | undefined = first(['a']);",
      ),
    ).toEqual(['line 2: TS2322']);
  });

  it('Section 1: constraints reject arguments that lack the required members (TS2345), and K extends keyof T catches a misspelled key', () => {
    expect(
      linesAndCodes(
        "function longest<T extends { length: number }>(a: T, b: T): T { return a.length >= b.length ? a : b; }\nlongest('ab', 'c');\nlongest(10, 20);",
      ),
    ).toEqual(['line 3: TS2345']);
    expect(typeOf(PLUCK, "pluck(users, 'age')")).toBe('number[]');
    expect(linesAndCodes(`${PLUCK}\npluck(users, 'nmae');`)).toEqual(['line 5: TS2345']);
  });

  it('Section 1: a default type argument applies when none is given or inferred (TS18046 on the unknown default)', () => {
    expect(linesAndCodes('interface ApiResponse<T = unknown> { data: T }\ndeclare const r: ApiResponse;\nexport const x = r.data.id;')).toEqual([
      'line 3: TS18046',
    ]);
  });

  it('Section 1: inference takes the first candidate from the arguments, and a callback return type is inferred', () => {
    expect(linesAndCodes("function pair<T>(a: T, b: T): [T, T] { return [a, b]; }\npair(1, 'a');")).toEqual(['line 2: TS2345']);
    const MAP_ALL = 'function mapAll<T, U>(items: readonly T[], fn: (item: T) => U): U[] { return items.map(fn); }';
    expect(typeOf(MAP_ALL, 'mapAll([1, 2], (n) => n.toFixed(1))')).toBe('string[]');
  });

  it('Section 1: a type parameter used only in the return type is inferred from the annotation, so it works as an unchecked cast', () => {
    const PARSE = 'function parse<T>(json: string): T { return JSON.parse(json); }';
    expect(linesAndCodes(`${PARSE}\nexport const n: number = parse('"text"');`)).toEqual([]);
    expect(typeOf(PARSE, "parse('{}')")).toBe('unknown');
  });

  it('Section 1: a const type parameter infers a readonly literal tuple; under a mutable array constraint 6.0.3 infers a mutable literal tuple', () => {
    expect(typeOf('function tuple<T>(x: T) { return x; }', "tuple(['a', 'b'])")).toBe('string[]');
    expect(typeOf('function tuple<const T>(x: T) { return x; }', "tuple(['a', 'b'])")).toBe('readonly ["a", "b"]');
    // The 5.0 release notes describe a fallback to the constraint (string[]) here; typescript 6.0.3 keeps the literals.
    expect(typeOf('function tuple<const T extends string[]>(x: T) { return x; }', "tuple(['a', 'b'])")).toBe('["a", "b"]');
    expect(typeOf('function tuple<const T extends readonly string[]>(x: T) { return x; }', "tuple(['a', 'b'])")).toBe(
      'readonly ["a", "b"]',
    );
  });

  it('Section 1: without NoInfer the fallback widens T; with NoInfer it is checked against the options (TS2345)', () => {
    expect(
      typeOf('function withDefault<T extends string>(options: T[], fallback: T): T { return fallback; }', "withDefault(['sm', 'md'], 'lg')"),
    ).toBe('"sm" | "md" | "lg"');
    expect(
      linesAndCodes(
        "function withDefault<T extends string>(options: T[], fallback: NoInfer<T>): T { return fallback; }\nwithDefault(['sm', 'md'], 'lg');",
      ),
    ).toEqual(['line 2: TS2345']);
  });
});
