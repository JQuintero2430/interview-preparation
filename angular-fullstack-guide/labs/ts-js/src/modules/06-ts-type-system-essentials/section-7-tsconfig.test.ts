// Section 7 claims: the strict family in 6.0.3, flags outside it, module settings, and TypeScript 6.0 defaults and deprecations.
import ts from 'typescript';
import { LAB_OPTIONS, diagnosticCodes } from './typecheck';

const TYPE_ROOTS = [new URL('../../../node_modules/@types', import.meta.url).pathname];
const UNTYPED = 'export function id(value) { return value; }';

describe('Module 06 · section 7', () => {
  it('Section 7: in typescript 6.0.3, strict turns on exactly eight flags', () => {
    const declarations = Reflect.get(ts, 'optionDeclarations') as { name: string; strictFlag?: boolean }[];
    expect(declarations.filter((option) => option.strictFlag).map((option) => option.name)).toEqual([
      'noImplicitAny',
      'strictNullChecks',
      'strictFunctionTypes',
      'strictBindCallApply',
      'strictPropertyInitialization',
      'strictBuiltinIteratorReturn',
      'noImplicitThis',
      'useUnknownInCatchVariables',
    ]);
  });

  it('Section 7: strict is on by default in TypeScript 6.0 (TS7006 with no options), and strict: false turns it off', () => {
    expect([diagnosticCodes(UNTYPED, {}), diagnosticCodes(UNTYPED, { strict: false })]).toEqual([[7006], []]);
  });

  it('Section 7: noUncheckedIndexedAccess is outside strict and makes an index read T | undefined (TS2322)', () => {
    const read = 'const xs: number[] = [];\nexport const first: number = xs[0];';
    expect([diagnosticCodes(read, { strict: true }), diagnosticCodes(read, { strict: true, noUncheckedIndexedAccess: true })]).toEqual([
      [],
      [2322],
    ]);
  });

  it('Section 7: exactOptionalPropertyTypes rejects an explicit undefined for an optional property (TS2375, TS2379) unless the type says | undefined', () => {
    const options = { strict: true, exactOptionalPropertyTypes: true };
    expect(diagnosticCodes('interface Profile { nick?: string }\nexport const p: Profile = { nick: undefined };', options)).toEqual([2375]);
    expect(
      diagnosticCodes('interface Profile { nick?: string }\nfunction save(p: Profile) { return p; }\nexport const r = save({ nick: undefined });', options),
    ).toEqual([2379]);
    expect(diagnosticCodes('interface Profile { nick?: string | undefined }\nexport const p: Profile = { nick: undefined };', options)).toEqual([]);
  });

  it('Section 7: noPropertyAccessFromIndexSignature (TS4111) and noImplicitOverride (TS4114) catch typos and silent overrides', () => {
    expect(diagnosticCodes('const env: Record<string, string> = {};\nexport const home = env.HOME;')).toEqual([4111]);
    expect(diagnosticCodes('class Base { save() {} }\nexport class Child extends Base { save() {} }')).toEqual([4114]);
  });

  it('Section 7: verbatimModuleSyntax requires import type for a type-only import (TS1484)', () => {
    const types = { '/virtual/types.ts': 'export interface User { name: string }' };
    expect(diagnosticCodes('import { User } from "./types";\nexport const user: User = { name: "Ada" };', LAB_OPTIONS, types)).toEqual([1484]);
    expect(diagnosticCodes('import type { User } from "./types";\nexport const user: User = { name: "Ada" };', LAB_OPTIONS, types)).toEqual([]);
  });

  it('Section 7: with the 6.0 default types, global @types packages are not loaded (TS2503) until listed or "*"', () => {
    const useChai = 'export type Check = Chai.Assertion;';
    const withRoots = (types?: string[]) => ({ ...LAB_OPTIONS, typeRoots: TYPE_ROOTS, types });
    expect(diagnosticCodes(useChai, withRoots(undefined))).toEqual([2503]);
    expect(diagnosticCodes(useChai, withRoots(['chai']))).toEqual([]);
    expect(diagnosticCodes(useChai, withRoots(['*']))).toEqual([]);
  });

  it('Section 7: options removed in 7.0 are deprecation errors in 6.0 (TS5107, TS5101) unless ignoreDeprecations is "6.0"', () => {
    expect(diagnosticCodes('export const x = 1;', { target: 'es5' })).toEqual([5107]);
    expect(diagnosticCodes('export const x = 1;', { moduleResolution: 'node10' })).toEqual([5107]);
    expect(diagnosticCodes('export const x = 1;', { baseUrl: '.' })).toEqual([5101]);
    expect(diagnosticCodes('export const x = 1;', { alwaysStrict: false })).toEqual([5107]);
    expect(diagnosticCodes('export const x = 1;', { target: 'es5', ignoreDeprecations: '6.0' })).toEqual([]);
  });

  it('Section 7: without an explicit rootDir, sources under src/ move the output to dist/src and report TS5011 (6.0 default rootDir is the tsconfig folder)', () => {
    const emitLayout = (extra: ts.CompilerOptions) => {
      const files: Record<string, string> = { '/virtual/src/a.ts': 'export const a = 1;' };
      const options: ts.CompilerOptions = {
        outDir: '/virtual/dist',
        configFilePath: '/virtual/tsconfig.json',
        types: [],
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2024,
        ...extra,
      };
      const host = ts.createCompilerHost(options);
      const readSource = host.getSourceFile.bind(host);
      const written: string[] = [];
      host.getSourceFile = (file, version) => (file in files ? ts.createSourceFile(file, files[file] ?? '', version) : readSource(file, version));
      host.fileExists = (file) => file in files || ts.sys.fileExists(file);
      host.readFile = (file) => files[file] ?? ts.sys.readFile(file);
      host.getCurrentDirectory = () => '/virtual';
      host.writeFile = (file) => void written.push(file);
      const program = ts.createProgram(Object.keys(files), options, host);
      const emitted = program.emit();
      return { written, codes: [...program.getOptionsDiagnostics(), ...emitted.diagnostics].map((diagnostic) => diagnostic.code) };
    };
    expect(emitLayout({})).toEqual({ written: ['/virtual/dist/src/a.js'], codes: [5011] });
    expect(emitLayout({ rootDir: '/virtual/src' })).toEqual({ written: ['/virtual/dist/a.js'], codes: [] });
  });

  it('Section 7: noUncheckedSideEffectImports is on by default, so an undeclared side-effect import is TS2882 until declared or switched off', () => {
    const sideEffect = "import './styles.css';\nexport const x = 1;";
    expect([diagnosticCodes(sideEffect, {}), diagnosticCodes(sideEffect, { noUncheckedSideEffectImports: false })]).toEqual([[2882], []]);
    expect(diagnosticCodes(sideEffect, {}, { '/virtual/css.d.ts': "declare module '*.css';" })).toEqual([]);
  });

  it('Section 7: with the 6.0 default types, a Node global such as process is TS2591', () => {
    expect(diagnosticCodes("export const home = process.env['HOME'];", {})).toEqual([2591]);
  });
});
