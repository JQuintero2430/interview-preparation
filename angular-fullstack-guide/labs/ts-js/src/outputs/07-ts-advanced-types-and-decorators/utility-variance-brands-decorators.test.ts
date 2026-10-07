// Q07.08–Q07.14. Fixtures are compiled with the TypeScript 6.0.3 compiler API; the Bug hunt fixture is also transpiled and run.
import ts from 'typescript';
import { typecheck } from '../../modules/06-ts-type-system-essentials/typecheck';

// A variable specifier keeps node:fs out of the bundler's static graph (the lab has no @types/node).
const fsSpecifier = 'node:fs';
const { readFileSync } = (await import(fsSpecifier)) as { readFileSync: (path: URL, encoding: 'utf8') => string };

const fixture = (name: string) => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8');
const linesAndCodes = (code: string, options?: Record<string, unknown>) =>
  typecheck(code, options).map(({ line, code: diagnostic }) => `line ${line}: TS${diagnostic}`);
/** Transpiles `code` to CommonJS and runs it, returning its exports or the message it threw. */
const run = (code: string) => {
  const js = ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
  const exports: Record<string, unknown> = {};
  try {
    new Function('exports', js)(exports);
    return { exports };
  } catch (error) {
    return { exports, thrown: (error as Error).message };
  }
};

const EQUAL = 'type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;\n';

describe('Module 07 · Questions on utility types, variance, brands and decorators', () => {
  it('Q07.09 evidence: Exclude and Extract filter a union of members, Pick and Omit filter an object type by key', () => {
    expect(
      linesAndCodes(`${EQUAL}type Role = 'admin' | 'editor' | 'viewer';
interface User { id: string; name: string; email: string }
export const c1: Equal<Exclude<Role, 'admin'>, 'editor' | 'viewer'> = true;
export const c2: Equal<Extract<Role, 'admin' | 'owner'>, 'admin'> = true;
export const c3: Equal<Pick<User, 'id'>, { id: string }> = true;
export const c4: Equal<Omit<User, 'id'>, { name: string; email: string }> = true;
export const c5: Equal<Exclude<User, 'id'>, User> = true;`),
    ).toEqual([]);
  });

  it('Q07.11 a method-syntax member accepts a narrower handler, which crashes at run time; property syntax rejects it (TS2322)', () => {
    const source = fixture('q07-11.ts');
    expect(linesAndCodes(source)).toEqual([]);
    expect(run(source).thrown).toBe("Cannot read properties of undefined (reading 'toFixed')");
    const fixed = source.replace('  handle(event: AppEvent): void;', '  handle: (event: AppEvent) => void;');
    expect(linesAndCodes(fixed)).toEqual(['line 17: TS2322']);
  });

  it('Q07.11 evidence: the fixed handler narrows the union itself and handles both events', () => {
    const source = fixture('q07-11.ts')
      .replace('  handle(event: AppEvent): void;', '  handle: (event: AppEvent) => void;')
      .replace('  handle(event: PaymentEvent) {\n    receipts.push(event.amount.toFixed(2));\n  },', "  handle: (event) => {\n    if (event.kind === 'payment') receipts.push(event.amount.toFixed(2));\n  },")
      .replace("audit.handle({ kind: 'login', user: 'ann' });", "audit.handle({ kind: 'login', user: 'ann' });\naudit.handle({ kind: 'payment', amount: 5 });");
    expect(linesAndCodes(source)).toEqual([]);
    expect(run(source)).toEqual({ exports: { receipts: ['5.00'], audit: expect.anything() } });
  });

  it('Q07.13 evidence: a parameter decorator is TS1206 under standard decorators and compiles under experimentalDecorators', () => {
    const code = `declare function Inject(token: string): ParameterDecorator;
export class Probe {
  constructor(@Inject('GREETING') readonly greeting: string) {}
}`;
    expect(linesAndCodes(code)).toEqual(['line 3: TS1206']);
    expect(linesAndCodes(code, { strict: true, target: 'es2022', lib: ['esnext'], experimentalDecorators: true })).toEqual([]);
  });
});
