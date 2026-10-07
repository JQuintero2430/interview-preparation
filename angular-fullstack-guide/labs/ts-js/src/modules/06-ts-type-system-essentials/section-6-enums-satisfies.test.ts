// Section 6 claims: enum emit and assignability, as const objects, satisfies, and unchecked assertions.
import ts from 'typescript';
import { diagnosticCodes, typecheck } from './typecheck';

/** Per-file emit, the way esbuild, Vitest or ts.transpileModule see a file. */
const emit = (code: string) =>
  ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2024, module: ts.ModuleKind.Preserve } }).outputText;

const STATUS = "export const Status = { Active: 'active', Disabled: 'disabled' } as const;\nexport type Status = (typeof Status)[keyof typeof Status];\n";

describe('Module 06 · section 6', () => {
  it('Section 6: a numeric enum emits an object with a reverse mapping; a string enum has none', () => {
    expect(emit('export enum Direction { Up, Down }')).toBe(
      'export var Direction;\n(function (Direction) {\n    Direction[Direction["Up"] = 0] = "Up";\n    Direction[Direction["Down"] = 1] = "Down";\n})(Direction || (Direction = {}));\n',
    );
    expect(emit("export enum Mode { Dark = 'dark' }")).toBe(
      'export var Mode;\n(function (Mode) {\n    Mode["Dark"] = "dark";\n})(Mode || (Mode = {}));\n',
    );
  });

  it('Section 6: a per-file transpiler emits a const enum as a normal enum and does not inline its members', () => {
    expect(emit('const enum Level { Low = 1 }\nexport const level = Level.Low;')).toBe(
      'var Level;\n(function (Level) {\n    Level[Level["Low"] = 1] = "Low";\n})(Level || (Level = {}));\nexport const level = Level.Low;\n',
    );
  });

  it('Section 6: isolatedModules refuses to use a const enum declared in a .d.ts file (TS2748, reported at the use)', () => {
    const declarations = { '/virtual/levels.d.ts': 'declare const enum Level { Low = 1 }' };
    const [diagnostic] = typecheck('export const level = Level.Low;', { isolatedModules: true }, declarations);
    expect([diagnostic?.code, diagnostic?.message]).toEqual([2748, "Cannot access ambient const enums when 'isolatedModules' is enabled."]);
  });

  it('Section 6: an out-of-range literal is rejected (TS2322), but any number variable is accepted', () => {
    const DIRECTION = 'enum Direction { Up, Down }\n';
    expect(diagnosticCodes(`${DIRECTION}export const d: Direction = 99;`)).toEqual([2322]);
    expect(diagnosticCodes(`${DIRECTION}const n: number = 99;\nexport const d: Direction = n;`)).toEqual([]);
  });

  it('Section 6: a let initialised with a literal widens to string, while a const keeps the literal (TS2322)', () => {
    const widened = "let a = 'x';\nconst b = 'x';\nexport const fromLet: 'x' = a;\nexport const fromConst: 'x' = b;";
    expect(typecheck(widened).map(({ line, code }) => `line ${line}: TS${code}`)).toEqual(['line 3: TS2322']);
  });

  it('Section 6: a string enum rejects its own string value (TS2322)', () => {
    expect(diagnosticCodes("enum Mode { Dark = 'dark' }\nexport const m: Mode = 'dark';")).toEqual([2322]);
  });

  it('Section 6: an as const object gives a literal union that accepts its values and rejects others (TS2322)', () => {
    expect(diagnosticCodes(`${STATUS}export const s: Status = 'active';`)).toEqual([]);
    expect(diagnosticCodes(`${STATUS}export const s: Status = 'archived';`)).toEqual([2322]);
  });

  it('Section 6: as const keeps literal types and makes properties readonly (TS2322, TS2540)', () => {
    expect(diagnosticCodes("const config = { mode: 'dark' };\nexport const m: 'dark' = config.mode;")).toEqual([2322]);
    expect(diagnosticCodes("const config = { mode: 'dark' } as const;\nexport const m: 'dark' = config.mode;")).toEqual([]);
    expect(diagnosticCodes("const config = { mode: 'dark' } as const;\nconfig.mode = 'light';")).toEqual([2540]);
  });

  it('Section 6: an annotation forgets the keys, while satisfies checks the values and keeps the keys (TS2339, TS2322)', () => {
    expect(diagnosticCodes("const palette: Record<string, string> = { red: '#f00' };\nexport const blue = palette['blue'];")).toEqual([]);
    expect(diagnosticCodes("const palette = { red: '#f00' } satisfies Record<string, string>;\nexport const blue = palette.blue;")).toEqual([2339]);
    expect(diagnosticCodes('export const palette = { red: 1 } satisfies Record<string, string>;')).toEqual([2322]);
  });

  it('Section 6: as is unchecked against the data; only an implausible conversion is refused (TS2352), and as unknown as bypasses that', () => {
    expect(diagnosticCodes("const user = JSON.parse('{}') as { name: string };\nexport const n = user.name.length;")).toEqual([]);
    expect(diagnosticCodes("export const n = 'text' as number;")).toEqual([2352]);
    expect(diagnosticCodes("export const n = 'text' as unknown as number;")).toEqual([]);
  });
});
