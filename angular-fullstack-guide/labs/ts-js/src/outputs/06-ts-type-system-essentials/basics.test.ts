// Q06.01–Q06.08. Output questions compile a fixture with the TypeScript 6.0.3 compiler API and assert each diagnostic's line and code.
import { diagnosticCodes, typecheck } from '../../modules/06-ts-type-system-essentials/typecheck';

// A variable specifier keeps node:fs out of the bundler's static graph (the lab has no @types/node).
const fsSpecifier = 'node:fs';
const { readFileSync } = (await import(fsSpecifier)) as { readFileSync: (path: URL, encoding: 'utf8') => string };

const fixture = (name: string) => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8');
// Inserting `const probe: never = <name>;` before a line makes TS2322 print the narrowed type at that point.
const typeAt = (code: string, line: number, name: string) => {
  const lines = code.split('\n');
  lines.splice(line - 1, 0, `const probe: never = ${name};`);
  const probe = typecheck(lines.join('\n')).find((diagnostic) => diagnostic.line === line && diagnostic.code === 2322);
  return probe?.message.match(/^Type '(.+?)' is not assignable to type 'never'/)?.[1];
};
const linesAndCodes = (code: string) => typecheck(code).map(({ line, code: diagnostic }) => `line ${line}: TS${diagnostic}`);

describe('Module 06 · Output questions: what TypeScript is, structural typing and narrowing', () => {
  it('Q06.04 only fresh literals get excess property checks, a near-miss key gets TS2561, and a weak type rejects a value with nothing in common', () => {
    expect(linesAndCodes(fixture('q06-04.ts'))).toEqual(['line 10: TS2353', 'line 13: TS2561', 'line 15: TS2559']);
  });

  it('Q06.07 typeof "object" keeps null, the early return leaves number, and a failed && in-check still allows null', () => {
    const source = fixture('q06-07.ts');
    expect(linesAndCodes(source)).toEqual(['line 6: TS18047', 'line 18: TS18047']);
    expect([typeAt(source, 6, 'value'), typeAt(source, 9, 'value'), typeAt(source, 16, 'pet'), typeAt(source, 18, 'pet')]).toEqual([
      'string[] | null',
      'number',
      'Cat',
      'Dog | null',
    ]);
  });

  it('Q06.04 and Q06.05 evidence: spread properties escape the excess check, and a plain object fits a class type without private members', () => {
    expect(linesAndCodes(`interface Point { x: number; y: number }
const raw = { x: 1, y: 2, z: 3 };
export const spread: Point = { ...raw };
class User { name = ''; greet() { return this.name; } }
export const plain: User = { name: 'Ada', greet: () => 'Ada' };`)).toEqual([]);
  });

  it('Q06.06 evidence: Object.freeze types its result as readonly (shallowly), and bracket access reaches a TypeScript private', () => {
    expect(linesAndCodes(`const config = Object.freeze({ retries: 1, nested: { depth: 2 } });
config.retries = 2;
config.nested.depth = 3;`)).toEqual(['line 2: TS2540']);
    expect(linesAndCodes(`class Account { private pin = 1234; }
const account = new Account();
export const viaBracket: number = account['pin'];
export const viaDot = account.pin;`)).toEqual(['line 4: TS2341']);
  });

  it('Q06.08 the buggy guard compiles and accepts a viewer; the fixed guard compiles and rejects it', () => {
    const buggySource = `interface Admin { role: 'admin'; permissions: string[] }
export function isAdmin(user: unknown): user is Admin {
  return typeof user === 'object' && user !== null && 'role' in user;
}`;
    const fixedSource = `interface Admin { role: 'admin'; permissions: string[] }
export function isAdmin(user: unknown): user is Admin {
  return (
    typeof user === 'object' && user !== null &&
    'role' in user && user.role === 'admin' &&
    'permissions' in user && Array.isArray(user.permissions) &&
    user.permissions.every((permission) => typeof permission === 'string')
  );
}`;
    expect([diagnosticCodes(buggySource), diagnosticCodes(fixedSource)]).toEqual([[], []]);

    const viewer: unknown = JSON.parse('{"role":"viewer"}');
    const buggy = (user: unknown) => typeof user === 'object' && user !== null && 'role' in user;
    const fixed = (user: unknown) =>
      typeof user === 'object' &&
      user !== null &&
      'role' in user &&
      user.role === 'admin' &&
      'permissions' in user &&
      Array.isArray(user.permissions) &&
      user.permissions.every((permission) => typeof permission === 'string');
    expect([buggy(viewer), fixed(viewer), fixed({ role: 'admin', permissions: ['delete'] })]).toEqual([true, false, true]);
  });
});
