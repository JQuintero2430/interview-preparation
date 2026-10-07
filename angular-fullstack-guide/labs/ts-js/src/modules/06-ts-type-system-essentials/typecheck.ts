// Type-level claims for module 06: compile a snippet with the real TypeScript compiler and return its diagnostics.
import ts from 'typescript';

/** One compiler diagnostic, reduced to what a test compares. */
export interface Diagnostic {
  /** The virtual file it belongs to, such as `/virtual/main.ts`. */
  file: string;
  /** 1-based line in that file (0 for a diagnostic without a position, such as an options error). */
  line: number;
  /** The number after `TS`, such as `2322`. */
  code: number;
  message: string;
}

/** Compiler options written as in `tsconfig.json`. */
export type TsconfigOptions = Record<string, unknown>;

/**
 * The lab's own settings (labs/ts-js/tsconfig.json), so snippets are checked like the module's code.
 * `lib` omits DOM to keep each check fast; pass it explicitly when a snippet needs browser types.
 */
export const LAB_OPTIONS: TsconfigOptions = {
  strict: true,
  noImplicitOverride: true,
  noPropertyAccessFromIndexSignature: true,
  noImplicitReturns: true,
  noFallthroughCasesInSwitch: true,
  noUncheckedIndexedAccess: true,
  target: 'es2024',
  lib: ['esnext'],
  module: 'preserve',
  moduleResolution: 'bundler',
  isolatedModules: true,
  verbatimModuleSyntax: true,
};

export const MAIN_FILE = '/virtual/main.ts';

// Library files (lib.*.d.ts) never change, so they are parsed once and shared by every check.
const libraryFiles = new Map<string, ts.SourceFile | undefined>();

/**
 * Type-checks `code` as `/virtual/main.ts`, together with any extra virtual files.
 * @param code The snippet.
 * @param options tsconfig-style options; `{}` means TypeScript's own defaults. `noEmit` and `types: []` are always added.
 * @param extraFiles More virtual files, keyed by absolute path (for imports, `.d.ts` files and augmentation).
 * @returns Every diagnostic, in the compiler's order.
 */
export function typecheck(code: string, options: TsconfigOptions = LAB_OPTIONS, extraFiles: Record<string, string> = {}): Diagnostic[] {
  const files: Record<string, string> = { ...extraFiles, [MAIN_FILE]: code };
  const converted = ts.convertCompilerOptionsFromJson({ types: [], ...options, noEmit: true }, '/');
  if (converted.errors.length > 0) {
    throw new Error(converted.errors.map((error) => ts.flattenDiagnosticMessageText(error.messageText, ' ')).join('; '));
  }
  const host = createVirtualHost(converted.options, files);
  const program = ts.createProgram(Object.keys(files), converted.options, host);
  return ts.getPreEmitDiagnostics(program).map(toDiagnostic);
}

/** @returns Only the codes, which is what most assertions need. */
export function diagnosticCodes(code: string, options?: TsconfigOptions, extraFiles?: Record<string, string>): number[] {
  return typecheck(code, options, extraFiles).map((diagnostic) => diagnostic.code);
}

function createVirtualHost(options: ts.CompilerOptions, files: Record<string, string>): ts.CompilerHost {
  const host = ts.createCompilerHost(options);
  const readRealFile = host.getSourceFile.bind(host);
  const realFileExists = host.fileExists.bind(host);
  const realReadFile = host.readFile.bind(host);
  const realDirectoryExists = host.directoryExists?.bind(host);
  const isVirtual = (path: string): path is keyof typeof files => Object.hasOwn(files, path);

  host.getSourceFile = (fileName, languageVersion) => {
    if (isVirtual(fileName)) return ts.createSourceFile(fileName, files[fileName] ?? '', languageVersion);
    if (!libraryFiles.has(fileName)) libraryFiles.set(fileName, readRealFile(fileName, languageVersion));
    return libraryFiles.get(fileName);
  };
  host.fileExists = (fileName) => isVirtual(fileName) || realFileExists(fileName);
  host.readFile = (fileName) => (isVirtual(fileName) ? files[fileName] : realReadFile(fileName));
  // Module resolution gives up on a directory it believes is missing, so the virtual folder must exist.
  host.directoryExists = (directory) =>
    Object.keys(files).some((path) => path.startsWith(`${directory}/`)) || (realDirectoryExists?.(directory) ?? false);
  return host;
}

function toDiagnostic(diagnostic: ts.Diagnostic): Diagnostic {
  const line =
    diagnostic.file && diagnostic.start !== undefined
      ? diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start).line + 1
      : 0;
  return {
    file: diagnostic.file?.fileName ?? '',
    line,
    code: diagnostic.code,
    message: ts.flattenDiagnosticMessageText(diagnostic.messageText, ' '),
  };
}
