// Section 2 claims: keyof, indexed access, typeof, mapped types with modifiers and key remapping, template literal types.
import { typecheck } from '../06-ts-type-system-essentials/typecheck';

const linesAndCodes = (code: string) => typecheck(code).map(({ line, code: diagnostic }) => `line ${line}: TS${diagnostic}`);

// Exact type equality (readonly and optional modifiers included): compiles only when A and B are the same type.
const EQUAL = 'type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;\n';
/** Compiles `pairs` as `[actual, expected]` equality assertions and returns the lines that failed. */
const failingEquals = (setup: string, pairs: [string, string][]) => {
  const checks = pairs.map(([actual, expected], index) => `export const check${index}: Equal<${actual}, ${expected}> = true;`);
  const offset = (EQUAL + setup).split('\n').length;
  return typecheck(`${EQUAL}${setup}\n${checks.join('\n')}`).map(({ line }) => pairs[line - offset]?.[0] ?? `line ${line}`);
};

const USER = "interface User { readonly id: string; name: string; email?: string; age: number }\n";

describe('Module 07 · section 2', () => {
  it('Section 2: the Equal helper tells types apart, including readonly modifiers', () => {
    expect(failingEquals('', [['{ a: string }', '{ readonly a: string }'], ['{ a: string }', '{ a: string }']])).toEqual([
      '{ a: string }',
    ]);
  });

  it('Section 2: keyof gives the key union, an index signature widens it, and T[K] reads property types', () => {
    expect(
      failingEquals(USER, [
        ['keyof User', "'id' | 'name' | 'email' | 'age'"],
        ["User['age']", 'number'],
        ["User['name' | 'age']", 'string | number'],
        ['keyof Record<string, number>', 'string'],
        ['keyof { [key: string]: number }', 'string | number'],
      ]),
    ).toEqual([]);
  });

  it('Section 2: typeof and (typeof array)[number] derive types from values', () => {
    const ROLES = "const ROLES = ['admin', 'editor', 'viewer'] as const;\nconst DEFAULTS = { theme: 'dark', pageSize: 20 };\n";
    expect(
      failingEquals(ROLES, [
        ['(typeof ROLES)[number]', "'admin' | 'editor' | 'viewer'"],
        ['typeof DEFAULTS', '{ theme: string; pageSize: number }'],
      ]),
    ).toEqual([]);
  });

  it('Section 2: mapped types add or remove readonly and ? with + and -, and a homomorphic mapping keeps them', () => {
    const MAPPERS = `${USER}type Mutable<T> = { -readonly [K in keyof T]: T[K] };
type Concrete<T> = { [K in keyof T]-?: T[K] };
type Frozen<T> = { readonly [K in keyof T]: T[K] };
type Copy<T> = { [K in keyof T]: T[K] };
type ByName<T, Keys extends PropertyKey> = { [K in Keys]: K extends keyof T ? T[K] : never };
`;
    expect(
      failingEquals(MAPPERS, [
        ['Mutable<User>', '{ id: string; name: string; email?: string; age: number }'],
        ['Concrete<User>', '{ readonly id: string; name: string; email: string; age: number }'],
        ['Frozen<{ a: string }>', '{ readonly a: string }'],
        ['Copy<User>', 'User'],
        ["ByName<User, 'id' | 'email'>", '{ id: string; email: string | undefined }'],
      ]),
    ).toEqual([]);
  });

  it('Section 2: as remaps keys with template literal types, and mapping a key to never removes it', () => {
    const REMAP = `${USER}type Getters<T> = { [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K] };
type DataOnly<T> = { [K in keyof T as T[K] extends (...args: never[]) => unknown ? never : K]: T[K] };
interface Widget { id: number; label: string; render(): void }
`;
    expect(
      failingEquals(REMAP, [
        ["Getters<Pick<User, 'name' | 'age'>>", '{ getName: () => string; getAge: () => number }'],
        ['DataOnly<Widget>', '{ id: number; label: string }'],
      ]),
    ).toEqual([]);
  });

  it('Section 2: a template literal type over unions produces every combination, and rejects other strings (TS2322)', () => {
    const EVENTS = "type Phase = 'start' | 'end';\ntype EventName = `${'drag' | 'resize'}:${Phase}`;\n";
    expect(failingEquals(EVENTS, [['EventName', "'drag:start' | 'drag:end' | 'resize:start' | 'resize:end'"]])).toEqual([]);
    expect(linesAndCodes(`${EVENTS}export const ok: EventName = 'drag:end';\nexport const bad: EventName = 'drag:stop';`)).toEqual([
      'line 4: TS2322',
    ]);
  });
});
