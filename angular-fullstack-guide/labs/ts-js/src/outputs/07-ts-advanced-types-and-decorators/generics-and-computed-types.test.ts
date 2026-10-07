// Q07.01–Q07.07. Output questions compile a fixture with the TypeScript 6.0.3 compiler API, then check each named type by exact equality.
import { typecheck } from '../../modules/06-ts-type-system-essentials/typecheck';

// A variable specifier keeps node:fs out of the bundler's static graph (the lab has no @types/node).
const fsSpecifier = 'node:fs';
const { readFileSync } = (await import(fsSpecifier)) as { readFileSync: (path: URL, encoding: 'utf8') => string };

const fixture = (name: string) => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8');
const linesAndCodes = (code: string) => typecheck(code).map(({ line, code: diagnostic }) => `line ${line}: TS${diagnostic}`);

const EQUAL = 'type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;';
/** Appends one exact-equality assertion per `[actual, expected]` pair to `source` and returns the actual types that failed. */
const failingEquals = (source: string, pairs: [string, string][]) => {
  const offset = source.split('\n').length + 1;
  const checks = pairs.map(([actual, expected], index) => `export const check${index}: Equal<${actual}, ${expected}> = true;`);
  return typecheck(`${source}\n${EQUAL}\n${checks.join('\n')}`)
    .filter(({ line }) => line > offset)
    .map(({ line }) => pairs[line - offset - 1]?.[0] ?? `line ${line}`);
};

describe('Module 07 · Output questions: generics, mapped and conditional types', () => {
  it('Q07.02 a const type parameter keeps the tuple, a plain one widens, and NoInfer turns the widening into TS2345', () => {
    const source = fixture('q07-02.ts');
    expect(linesAndCodes(source)).toEqual(['line 9: TS2345']);
    expect(
      failingEquals(source, [
        ['typeof a', 'readonly ["sm", "md"]'],
        ['typeof b', 'string[]'],
        ['typeof c', '"sm" | "md" | "lg"'],
      ]),
    ).toEqual([]);
    // The check itself is exact: a near miss (readonly versus mutable) is reported.
    expect(failingEquals(source, [['typeof b', 'readonly string[]']])).toEqual(['typeof b']);
  });

  it('Q07.03 keyof, modifier removal, a non-homomorphic mapping, key remapping and a template literal cross product', () => {
    const source = fixture('q07-03.ts');
    expect(linesAndCodes(source)).toEqual([]);
    expect(
      failingEquals(source, [
        ['A', "'id' | 'name' | 'email'"],
        ['B', '{ id: string; name: string; email: string }'],
        ['C', '{ id: string; email: string | undefined }'],
        ['D', '{ readonly getId: () => string; getName: () => string; getEmail?: () => string | undefined }'],
        ['E', "'drag:start' | 'drag:end' | 'resize:start' | 'resize:end'"],
      ]),
    ).toEqual([]);
  });

  it('Q07.06 naked type parameters distribute over unions and map never to never; bracketed ones do not', () => {
    const source = fixture('q07-06.ts');
    expect(linesAndCodes(source)).toEqual([]);
    expect(
      failingEquals(source, [
        ['A', "'yes' | 'no'"],
        ['B', "'no'"],
        ['C', 'never'],
        ['D', "'yes'"],
        ['E', 'string[] | number[]'],
        ['F', '1'],
      ]),
    ).toEqual([]);
  });

  it('Q07.07 the naive DeepReadonly blocks array writes (TS2339, TS2540) but makes methods uncallable (TS2349); a function branch fixes it', () => {
    const source = fixture('q07-07.ts');
    expect(linesAndCodes(source)).toEqual(['line 9: TS2339', 'line 10: TS2540', 'line 11: TS2349']);
    const fixed = source.replace(
      'type DeepReadonly<T> = { readonly [K in keyof T]: DeepReadonly<T[K]> };',
      'type DeepReadonly<T> = T extends (...args: never[]) => unknown ? T : { readonly [K in keyof T]: DeepReadonly<T[K]> };',
    );
    expect(linesAndCodes(fixed)).toEqual(['line 9: TS2339', 'line 10: TS2540']);
  });

  it('Q07.04, Q07.06 and Q07.07 evidence: as const keeps the role union, brackets stop distribution, and how DeepReadonly treats functions, arrays and Map', () => {
    const naive = 'type DeepReadonly<T> = { readonly [K in keyof T]: DeepReadonly<T[K]> };';
    const fixed = 'type Fixed<T> = T extends (...args: never[]) => unknown ? T : { readonly [K in keyof T]: Fixed<T[K]> };';
    const setup = `${naive}
${fixed}
const ROLES = ['admin', 'viewer'] as const;
const LOOSE = ['admin', 'viewer'];
type Whole<T> = [T] extends [unknown] ? T[] : never;
declare const map: Fixed<Map<string, number>>;
map.set('a', 1);`;
    expect(linesAndCodes(setup)).toEqual([]);
    expect(
      failingEquals(setup, [
        ['(typeof ROLES)[number]', "'admin' | 'viewer'"],
        ['(typeof LOOSE)[number]', 'string'],
        ['Whole<string | number>', '(string | number)[]'],
        ['DeepReadonly<() => number>', '{}'],
        ['DeepReadonly<number[]>', 'readonly number[]'],
      ]),
    ).toEqual([]);
  });

  it('Q07.01 evidence: any lets a string flow into a number, a type parameter does not', () => {
    expect(
      linesAndCodes(`declare function firstAny(items: any[]): any;
declare function first<T>(items: readonly T[]): T | undefined;
export const loose: number = firstAny(['a']);
export const typed: number | undefined = first(['a']);`),
    ).toEqual(['line 4: TS2322']);
  });
});
