// Section 4 claims: the built-in utility types are ordinary mapped and conditional types; hand-written versions match them.
import { typecheck } from '../06-ts-type-system-essentials/typecheck';

// A variable specifier keeps node:fs out of the bundler's static graph (the lab has no @types/node).
const fsSpecifier = 'node:fs';
const { readFileSync } = (await import(fsSpecifier)) as { readFileSync: (path: URL, encoding: 'utf8') => string };

const linesAndCodes = (code: string) => typecheck(code).map(({ line, code: diagnostic }) => `line ${line}: TS${diagnostic}`);

// Exact type equality (readonly and optional modifiers included): compiles only when A and B are the same type.
const EQUAL = 'type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;\n';
/** Compiles each `[actual, expected]` pair as an equality assertion and returns the actual types that failed. */
const failingEquals = (setup: string, pairs: [string, string][]) => {
  const checks = pairs.map(([actual, expected], index) => `export const check${index}: Equal<${actual}, ${expected}> = true;`);
  const offset = (EQUAL + setup).split('\n').length;
  return typecheck(`${EQUAL}${setup}\n${checks.join('\n')}`).map(({ line }) => pairs[line - offset]?.[0] ?? `line ${line}`);
};

const USER = 'interface User { readonly id: string; name: string; email?: string }\n';
const HAND_WRITTEN = `type MyPartial<T> = { [K in keyof T]?: T[K] };
type MyPick<T, K extends keyof T> = { [P in K]: T[P] };
type MyOmit<T, K extends PropertyKey> = MyPick<T, Exclude<keyof T, K>>;
type MyReturnType<F> = F extends (...args: never[]) => infer R ? R : never;
type MyAwaited<T> = T extends PromiseLike<infer V> ? MyAwaited<V> : T;
`;

describe('Module 07 · section 4', () => {
  it('Section 4: lib.es5.d.ts in typescript 6.0.3 defines the utilities as mapped and conditional types', () => {
    const lib = readFileSync(new URL('../../../node_modules/typescript/lib/lib.es5.d.ts', import.meta.url), 'utf8');
    expect([
      lib.includes('type Partial<T> = {\n    [P in keyof T]?: T[P];\n};'),
      lib.includes('type Pick<T, K extends keyof T> = {\n    [P in K]: T[P];\n};'),
      lib.includes('type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;'),
      lib.includes('type Exclude<T, U> = T extends U ? never : T;'),
      lib.includes('type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;'),
      lib.includes('type NonNullable<T> = T & {};'),
    ]).toEqual([true, true, true, true, true, true]);
  });

  it('Section 4: only five lib types are declared intrinsic (implemented by the compiler)', () => {
    const lib = readFileSync(new URL('../../../node_modules/typescript/lib/lib.es5.d.ts', import.meta.url), 'utf8');
    expect(lib.match(/^type (\w+)<[^>]*> = intrinsic;$/gm)?.map((line) => line.split(/[ <]/)[1])).toEqual([
      'Uppercase',
      'Lowercase',
      'Capitalize',
      'Uncapitalize',
      'NoInfer',
    ]);
  });

  it('Section 4: hand-written Partial, Pick, Omit, ReturnType and Awaited equal the built-ins on these inputs', () => {
    expect(
      failingEquals(`${USER}${HAND_WRITTEN}declare function loadUser(id: string): Promise<User>;\n`, [
        ['MyPartial<User>', 'Partial<User>'],
        ["MyPick<User, 'id' | 'email'>", "Pick<User, 'id' | 'email'>"],
        ["MyOmit<User, 'id'>", "Omit<User, 'id'>"],
        ['MyReturnType<typeof loadUser>', 'ReturnType<typeof loadUser>'],
        ['MyAwaited<Promise<Promise<number>>>', 'Awaited<Promise<Promise<number>>>'],
        ['Awaited<ReturnType<typeof loadUser>>', 'User'],
      ]),
    ).toEqual([]);
  });

  it('Section 4: Pick keeps readonly and ? (K extends keyof T), and DTOs derived from one entity follow it', () => {
    expect(
      failingEquals(`${USER}type CreateUser = Omit<User, 'id'>;\ntype UpdateUser = Pick<User, 'id'> & Partial<CreateUser>;\n`, [
        ["Pick<User, 'id' | 'email'>", '{ readonly id: string; email?: string }'],
        ['CreateUser', '{ name: string; email?: string }'],
        ["UpdateUser['name']", 'string | undefined'],
      ]),
    ).toEqual([]);
  });

  it('Section 4: Omit accepts a misspelled key silently, while Pick rejects it (TS2344)', () => {
    expect(failingEquals(USER, [["Omit<User, 'nmae'>", '{ readonly id: string; name: string; email?: string }']])).toEqual([]);
    expect(linesAndCodes(`${USER}export type Picked = Pick<User, 'nmae'>;`)).toEqual(['line 2: TS2344']);
  });

  it('Section 4: Omit over a union keeps only the common keys; a distributive Omit keeps each member', () => {
    const SHAPES = `type Shape = { kind: 'circle'; radius: number; id: string } | { kind: 'square'; side: number; id: string };
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
`;
    expect(
      failingEquals(SHAPES, [
        ["Omit<Shape, 'id'>", "{ kind: 'circle' | 'square' }"],
        ["DistributiveOmit<Shape, 'id'>", "{ kind: 'circle'; radius: number } | { kind: 'square'; side: number }"],
      ]),
    ).toEqual([]);
  });
});
