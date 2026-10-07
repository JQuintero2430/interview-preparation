// Section 1 claims: types are erased, per-file tools emit without checking, and Node 24 runs .ts by stripping types.
import ts from 'typescript';
import { diagnosticCodes } from './typecheck';
import { runNode, stdoutLines } from '../../outputs/run-node';

const fixture = (name: string) => new URL(`./fixtures/section-1/${name}`, import.meta.url);

/** Emits JavaScript the way a per-file transpiler does: one file, no type information. */
const transpile = (code: string) =>
  ts.transpileModule(code, {
    compilerOptions: { target: ts.ScriptTarget.ES2024, module: ts.ModuleKind.Preserve },
    reportDiagnostics: true,
  });

describe('Module 06 · section 1', () => {
  it('Section 1: interfaces and annotations are erased from the emitted JavaScript', () => {
    const { outputText } = transpile(
      'interface User { name: string }\nexport const greet = (user: User): string => `hello ${user.name}`;',
    );
    expect(outputText).toBe('export const greet = (user) => `hello ${user.name}`;\n');
  });

  it('Section 1: a per-file transpiler emits code with a type error and reports nothing; the checker reports TS2322', () => {
    const code = "export const port: number = '8080';";
    const { outputText, diagnostics } = transpile(code);
    expect([outputText, diagnostics]).toEqual(["export const port = '8080';\n", []]);
    expect(diagnosticCodes(code)).toEqual([2322]);
  });

  it('Section 1: Node 24 runs a .ts file by stripping its types', () => {
    expect(stdoutLines(runNode(fixture('greet.ts')))).toEqual(['hello Ada']);
  });

  it('Section 1: Node 24 does not type-check, so a type error runs', () => {
    expect(stdoutLines(runNode(fixture('unchecked.ts')))).toEqual(['string 80801']);
  });

  it('Section 1: Node 24 strip-only mode rejects an enum with ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX', () => {
    const run = runNode(fixture('status.ts'));
    expect(run.status).not.toBe(0);
    expect(run.stderr).toContain(
      'SyntaxError [ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX]: TypeScript enum is not supported in strip-only mode',
    );
  });

  it('Section 1: erasableSyntaxOnly makes the checker reject an enum and a parameter property (TS1294)', () => {
    expect(diagnosticCodes('enum Status { Active }', { erasableSyntaxOnly: true })).toEqual([1294]);
    expect(diagnosticCodes('export class Point { constructor(private x: number) {} }', { erasableSyntaxOnly: true })).toEqual([1294]);
  });

  it('Section 1: isolatedModules requires export type when re-exporting a type (TS1205)', () => {
    const types = { '/virtual/types.ts': 'export interface User { name: string }' };
    expect(diagnosticCodes('export { User } from "./types";', { isolatedModules: true }, types)).toEqual([1205]);
    expect(diagnosticCodes('export type { User } from "./types";', { isolatedModules: true }, types)).toEqual([]);
  });
});
