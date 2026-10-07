// Section 5 claims: any spreads, unknown blocks, never and void, catch variables, and object versus {} versus Object.
import { LAB_OPTIONS, diagnosticCodes } from './typecheck';

// A variable specifier keeps node:fs out of the bundler's static graph (the lab has no @types/node).
const fsSpecifier = 'node:fs';
const { readFileSync } = (await import(fsSpecifier)) as { readFileSync: (path: URL, encoding: 'utf8') => string };

const CATCH = "export function parse(text: string) { try { return JSON.parse(text); } catch (error) { return error.message; } }";

describe('Module 06 · section 5', () => {
  it('Section 5: JSON.parse and Response.json return any in typescript 6.0.3', () => {
    const lib = readFileSync(new URL('../../../node_modules/typescript/lib/lib.es5.d.ts', import.meta.url), 'utf8');
    expect(lib).toContain('parse(text: string, reviver?: (this: any, key: string, value: any) => any): any;');
    const dom = readFileSync(new URL('../../../node_modules/typescript/lib/lib.dom.d.ts', import.meta.url), 'utf8');
    expect(dom).toContain('json(): Promise<any>;');
  });

  it('Section 5: the readName snippet narrows unknown without assertions', () => {
    expect(
      diagnosticCodes(`export function readName(data: unknown): string {
  if (typeof data === 'object' && data !== null && 'name' in data && typeof data.name === 'string') {
    return data.name;
  }
  throw new TypeError('expected an object with a string name');
}`),
    ).toEqual([]);
  });

  it('Section 5: any spreads through property reads and assignments without a single error', () => {
    expect(diagnosticCodes("const data = JSON.parse('{}');\nexport const fixed = data.user.name.toFixed(2);\nexport const label: string = fixed;")).toEqual([]);
  });

  it('Section 5: unknown must be narrowed before use (TS18046)', () => {
    expect(diagnosticCodes("const data: unknown = JSON.parse('{}');\nexport const name = data.user;")).toEqual([18046]);
  });

  it('Section 5: nothing but never is assignable to never (TS2322)', () => {
    expect(diagnosticCodes('export const y: never = 1;')).toEqual([2322]);
  });

  it('Section 5: a callback typed to return void may return a value, but the result is unusable and a void declaration cannot return one', () => {
    expect(diagnosticCodes('const nums: number[] = [];\n[1, 2].forEach((n) => nums.push(n));\nexport const f: () => void = () => 1;')).toEqual([]);
    expect(diagnosticCodes('const f: () => void = () => 1;\nexport const r = f().toFixed();')).toEqual([2339]);
    expect(diagnosticCodes('export function f(): void { return 1; }')).toEqual([2322]);
  });

  it('Section 5: under strict a catch variable is unknown (TS18046); useUnknownInCatchVariables: false makes it any', () => {
    expect(diagnosticCodes(CATCH)).toEqual([18046]);
    expect(diagnosticCodes(CATCH, { ...LAB_OPTIONS, useUnknownInCatchVariables: false })).toEqual([]);
  });

  it('Section 5: object rejects primitives, {} accepts everything but null and undefined, and Object also checks its methods', () => {
    expect(diagnosticCodes('export const a: object = 1;')).toEqual([2322]);
    expect(diagnosticCodes('export const b: {} = 1;')).toEqual([]);
    expect(diagnosticCodes('export const c: {} = null;')).toEqual([2322]);
    expect(diagnosticCodes('export const d: Object = 1;')).toEqual([]);
    expect(diagnosticCodes('export const e: Object = { toString() { return 1; } };')).toEqual([2322]);
    expect(diagnosticCodes('export const f: {} = { toString() { return 1; } };')).toEqual([]);
  });
});
