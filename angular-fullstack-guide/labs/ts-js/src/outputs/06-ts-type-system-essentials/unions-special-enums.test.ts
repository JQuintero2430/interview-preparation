// Q06.09–Q06.16. Output questions compile a fixture with the TypeScript 6.0.3 compiler API and assert each diagnostic's line and code, or the emitted JavaScript.
import ts from 'typescript';
import { typecheck } from '../../modules/06-ts-type-system-essentials/typecheck';

// A variable specifier keeps node:fs out of the bundler's static graph (the lab has no @types/node).
const fsSpecifier = 'node:fs';
const { readFileSync } = (await import(fsSpecifier)) as { readFileSync: (path: URL, encoding: 'utf8') => string };

const fixture = (name: string) => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8');
const linesAndCodes = (code: string) => typecheck(code).map(({ line, code: diagnostic }) => `line ${line}: TS${diagnostic}`);
// `const probe: never = <expression>;` compiles only when the expression's type is never.
const isNever = (code: string, line: number, expression: string) => {
  const lines = code.split('\n');
  lines.splice(line - 1, 0, `const probe: never = ${expression};`);
  return !typecheck(lines.join('\n')).some((diagnostic) => diagnostic.line === line);
};

const EMIT_OPTIONS = { target: ts.ScriptTarget.ES2024, module: ts.ModuleKind.Preserve, noLib: true, types: [] };

/** Whole-program emit, the way tsc sees the file: const enum members can be inlined. */
function programEmit(code: string): string {
  const host = ts.createCompilerHost(EMIT_OPTIONS);
  const readFromDisk = host.getSourceFile;
  const output: string[] = [];
  host.getSourceFile = (fileName, languageVersion) =>
    fileName === '/virtual/enums.ts' ? ts.createSourceFile(fileName, code, languageVersion) : readFromDisk(fileName, languageVersion);
  host.writeFile = (_fileName, text) => output.push(text);
  ts.createProgram(['/virtual/enums.ts'], EMIT_OPTIONS, host).emit();
  return output.join('');
}

const ENUMS_JS = `export var Direction;
(function (Direction) {
    Direction[Direction["Up"] = 0] = "Up";
    Direction[Direction["Down"] = 1] = "Down";
})(Direction || (Direction = {}));
export var Mode;
(function (Mode) {
    Mode["Light"] = "light";
    Mode["Dark"] = "dark";
})(Mode || (Mode = {}));
`;

describe('Module 06 · Output questions: unions, special types and enums', () => {
  it('Q06.10, Q06.14 and Q06.16 evidence: grouped empty cases do not trip TS7029, T extends {} rejects null, and enum declarations merge', () => {
    expect(linesAndCodes(`export function f(k: 'a' | 'b' | 'c'): number {
  switch (k) { case 'a': case 'b': return 1; case 'c': return 2; }
}`)).toEqual([]);
    expect(linesAndCodes(`export function f(k: 'a' | 'b'): number {
  let n = 0;
  switch (k) { case 'a': n = 1; case 'b': n = 2; }
  return n;
}`)).toEqual(['line 3: TS7029']);
    expect(linesAndCodes('function notNullish<T extends {}>(value: T) { return value; }\nnotNullish(1);\nnotNullish(null);')).toEqual(['line 3: TS2345']);
    expect(linesAndCodes('export enum Flag { A }\nexport enum Flag { B = 1 }')).toEqual([]);
  });

  it('Q06.11 evidence: in a request-state union, data exists only after narrowing to success (TS2339 otherwise)', () => {
    const REQUEST_STATE = `type RequestState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };
declare const state: RequestState<string[]>;
`;
    expect(linesAndCodes(`${REQUEST_STATE}export const early = state.data;`)).toEqual(['line 7: TS2339']);
    expect(linesAndCodes(`${REQUEST_STATE}export const count = state.status === 'success' ? state.data.length : 0;`)).toEqual([]);
    expect(linesAndCodes(`${REQUEST_STATE}export const bad: RequestState<string[]> = { status: 'loading', error: 'x' };`)).toEqual(['line 7: TS2353']);
  });

  it('Q06.12 a union exposes only shared members, an intersection all of them, and conflicts produce never', () => {
    const source = fixture('q06-12.ts');
    expect(linesAndCodes(source)).toEqual(['line 12: TS2339', 'line 15: TS2322', 'line 16: TS2339']);
    expect([isNever(source, 14, 'clash.id'), isNever(source, 14, 'clash'), isNever(source, 16, 'conflict')]).toEqual([true, false, true]);
  });

  it('Q06.16 tsc emits objects for both enums and inlines the const enum; a per-file transpiler keeps it as an object', () => {
    const source = fixture('q06-16.ts');
    expect(programEmit(source)).toBe(`${ENUMS_JS}export const level = 2 /* Level.High */;\n`);
    expect(ts.transpileModule(source, { compilerOptions: EMIT_OPTIONS }).outputText).toBe(
      `${ENUMS_JS}var Level;
(function (Level) {
    Level[Level["Low"] = 1] = "Low";
    Level[Level["High"] = 2] = "High";
})(Level || (Level = {}));
export const level = Level.High;
`,
    );
  });
});
