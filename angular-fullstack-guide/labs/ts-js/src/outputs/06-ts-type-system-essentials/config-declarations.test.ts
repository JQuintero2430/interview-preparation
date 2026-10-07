// Q06.17–Q06.24. Output questions compile a fixture with the TypeScript 6.0.3 compiler API and assert each diagnostic's line and code.
import { LAB_OPTIONS, typecheck, type TsconfigOptions } from '../../modules/06-ts-type-system-essentials/typecheck';

// A variable specifier keeps node:fs out of the bundler's static graph (the lab has no @types/node).
const fsSpecifier = 'node:fs';
const { readFileSync } = (await import(fsSpecifier)) as { readFileSync: (path: URL, encoding: 'utf8') => string };

const fixture = (name: string) => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8');
const linesAndCodes = (code: string, options?: TsconfigOptions) =>
  typecheck(code, options).map(({ line, code: diagnostic }) => `line ${line}: TS${diagnostic}`);

const THEME = "type Theme = { mode: 'light' | 'dark' };\n";

describe('Module 06 · Output questions: assertions, tsconfig and declarations', () => {
  it('Q06.17 evidence: annotation and satisfies reject a wrong value, as rejects only a non-overlapping one, and only satisfies keeps the literal', () => {
    expect(linesAndCodes(`${THEME}export const a: Theme = { mode: 'dim' };`)).toEqual(['line 2: TS2322']);
    expect(linesAndCodes(`${THEME}export const b = { mode: 'dim' } satisfies Theme;`)).toEqual(['line 2: TS2322']);
    expect(linesAndCodes(`${THEME}export const c = { mode: 'dim' } as Theme;`)).toEqual(['line 2: TS2352']);
    expect(linesAndCodes(`${THEME}export const d = {} as Theme;`)).toEqual([]);
    expect(linesAndCodes(`${THEME}const s = { mode: 'dark' } satisfies Theme;\nexport const m: 'dark' = s.mode;`)).toEqual([]);
    expect(linesAndCodes(`${THEME}const t: Theme = { mode: 'dark' };\nexport const m: 'dark' = t.mode;`)).toEqual(['line 3: TS2322']);
    expect(linesAndCodes(`${THEME}const k = { mode: 'dark' } as const satisfies Theme;\nexport const m: 'dark' = k.mode;\nk.mode = 'dark';`)).toEqual([
      'line 4: TS2540',
    ]);
    expect(linesAndCodes(`${THEME}export const x = { mode: 'dim' } as const satisfies Theme;`)).toEqual(['line 2: TS2322']);
  });

  it('Q06.18 evidence: the asserted response compiles and crashes on null; the narrowed version compiles', () => {
    const asserted = "type User = { name: string };\nconst user = JSON.parse('{\"name\":null}') as User;\nexport const shout = user.name.toUpperCase();";
    expect(linesAndCodes(asserted)).toEqual([]);
    const user = JSON.parse('{"name":null}') as { name: string };
    expect(() => user.name.toUpperCase()).toThrow(new TypeError("Cannot read properties of null (reading 'toUpperCase')"));
    const narrowed = `const data: unknown = JSON.parse('{"name":null}');
export const shout =
  typeof data === 'object' && data !== null && 'name' in data && typeof data.name === 'string' ? data.name.toUpperCase() : 'ANONYMOUS';`;
    expect(linesAndCodes(narrowed)).toEqual([]);
  });

  it('Q06.24 evidence: interface Window in a module file without declare global is a new local type (TS2339)', () => {
    const dom = { ...LAB_OPTIONS, lib: ['esnext', 'dom'] };
    expect(linesAndCodes('export {};\ninterface Window { appConfig: { apiUrl: string } }\nexport const url = window.appConfig.apiUrl;', dom)).toEqual([
      'line 3: TS2339',
    ]);
  });

  it('Q06.21 exactOptionalPropertyTypes rejects an explicit undefined, and noUncheckedIndexedAccess adds undefined to indexed reads', () => {
    const source = fixture('q06-21.ts');
    expect(linesAndCodes(source, { ...LAB_OPTIONS, exactOptionalPropertyTypes: true })).toEqual([
      'line 8: TS2375',
      'line 11: TS2322',
      'line 13: TS2322',
    ]);
    expect(linesAndCodes(source, { strict: true })).toEqual([]);
  });
});
