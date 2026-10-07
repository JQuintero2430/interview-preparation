import { MAIN_FILE, diagnosticCodes, typecheck } from './typecheck';

describe('Module 06 · typecheck helper', () => {
  it('returns no diagnostics for a correct snippet', () => {
    expect(typecheck('const total: number = [1, 2].reduce((sum, n) => sum + n, 0);')).toEqual([]);
  });

  it('returns the code, file and line of each error', () => {
    expect(typecheck('const ok = 1;\nconst wrong: number = "a";')).toEqual([
      { file: MAIN_FILE, line: 2, code: 2322, message: "Type 'string' is not assignable to type 'number'." },
    ]);
  });

  it('uses TypeScript defaults for {} and accepts tsconfig-style options', () => {
    const untyped = 'export function id(value) { return value; }';
    expect([diagnosticCodes(untyped, {}), diagnosticCodes(untyped, { strict: false })]).toEqual([[7006], []]);
  });

  it('resolves imports between virtual files', () => {
    const types = { '/virtual/types.ts': 'export interface User { name: string }' };
    expect(diagnosticCodes('import type { User } from "./types";\nexport const user: User = { name: "Ada" };', undefined, types)).toEqual([]);
  });
});
