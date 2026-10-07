// Section 3 claims: conditional types, distribution over unions, infer, recursive types and the depth limit.
import { typecheck } from '../06-ts-type-system-essentials/typecheck';

const linesAndCodes = (code: string) => typecheck(code).map(({ line, code: diagnostic }) => `line ${line}: TS${diagnostic}`);

// Exact type equality (readonly and optional modifiers included): compiles only when A and B are the same type.
const EQUAL = 'type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;\n';
/** Compiles each `[actual, expected]` pair as an equality assertion and returns the actual types that failed. */
const failingEquals = (setup: string, pairs: [string, string][]) => {
  const checks = pairs.map(([actual, expected], index) => `export const check${index}: Equal<${actual}, ${expected}> = true;`);
  const offset = (EQUAL + setup).split('\n').length;
  return typecheck(`${EQUAL}${setup}\n${checks.join('\n')}`).map(({ line }) => pairs[line - offset]?.[0] ?? `line ${line}`);
};

describe('Module 07 · section 3', () => {
  it('Section 3: a conditional type over a naked type parameter distributes over a union, and brackets stop it', () => {
    const SETUP = `type IsString<T> = T extends string ? 'yes' : 'no';
type IsStringWhole<T> = [T] extends [string] ? 'yes' : 'no';
type ToArray<T> = T extends unknown ? T[] : never;
`;
    expect(
      failingEquals(SETUP, [
        ["IsString<'a' | 1>", "'yes' | 'no'"],
        ["IsStringWhole<'a' | 1>", "'no'"],
        ['ToArray<string | number>', 'string[] | number[]'],
        ['IsString<never>', 'never'],
        ['IsStringWhole<never>', "'yes'"],
      ]),
    ).toEqual([]);
  });

  it('Section 3: infer extracts types from arrays, promises, functions and template literals', () => {
    const SETUP = `type ElementOf<T> = T extends readonly (infer E)[] ? E : never;
type Unwrap<T> = T extends Promise<infer V> ? V : T;
type FirstArg<F> = F extends (first: infer A, ...rest: never[]) => unknown ? A : never;
type RouteParams<S extends string> = S extends \`\${string}:\${infer P}/\${infer Rest}\`
  ? P | RouteParams<Rest>
  : S extends \`\${string}:\${infer P}\` ? P : never;
`;
    expect(
      failingEquals(SETUP, [
        ["ElementOf<readonly ['a', 'b']>", "'a' | 'b'"],
        ['Unwrap<Promise<number>>', 'number'],
        ['Unwrap<string>', 'string'],
        ['FirstArg<(id: string, force: boolean) => void>', 'string'],
        ["RouteParams<'/users/:userId/posts/:postId'>", "'userId' | 'postId'"],
      ]),
    ).toEqual([]);
  });

  it('Section 3: a naive recursive DeepReadonly handles arrays and nesting but makes methods uncallable (TS2349)', () => {
    const CONFIG = `interface Config { tags: string[]; nested: { level: number }; save(): void }
declare const config: DeepReadonly<Config>;
`;
    const naive = `type DeepReadonly<T> = { readonly [K in keyof T]: DeepReadonly<T[K]> };\n${CONFIG}`;
    expect(linesAndCodes(`${naive}config.tags.push('x');\nconfig.nested.level = 2;\nconfig.save();`)).toEqual([
      'line 4: TS2339',
      'line 5: TS2540',
      'line 6: TS2349',
    ]);
    const fixed = `type DeepReadonly<T> = T extends (...args: never[]) => unknown ? T : { readonly [K in keyof T]: DeepReadonly<T[K]> };\n${CONFIG}`;
    expect(linesAndCodes(`${fixed}config.tags.push('x');\nconfig.nested.level = 2;\nconfig.save();`)).toEqual(['line 4: TS2339', 'line 5: TS2540']);
  });

  it('Section 3: a recursive type alias describes JSON, and rejects a function value (TS2322)', () => {
    const JSON_TYPE = 'type Json = string | number | boolean | null | Json[] | { [key: string]: Json };\n';
    expect(linesAndCodes(`${JSON_TYPE}export const ok: Json = { a: [1, { b: null }] };\nexport const bad: Json = { a: () => 1 };`)).toEqual([
      'line 3: TS2322',
    ]);
  });

  it('Section 3: recursion hits TS2589, sooner when the recursive call is not in tail position', () => {
    const TAIL = "type Build<N extends number, Acc extends unknown[] = []> = Acc['length'] extends N ? Acc : Build<N, [...Acc, 0]>;\n";
    expect(linesAndCodes(`${TAIL}export type Fine = Build<999>;\nexport type TooDeep = Build<1500>;`)).toEqual(['line 3: TS2589']);
    const NOT_TAIL = "type Repeat<N extends number, Acc extends unknown[] = []> = Acc['length'] extends N ? '' : `a${Repeat<N, [...Acc, 0]>}`;\n";
    expect(linesAndCodes(`${NOT_TAIL}export type Fine = Repeat<40>;\nexport type TooDeep = Repeat<100>;`)).toEqual(['line 3: TS2589']);
  });
});
