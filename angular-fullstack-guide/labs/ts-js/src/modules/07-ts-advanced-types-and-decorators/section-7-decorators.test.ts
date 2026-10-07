// Section 7 claims: standard decorators run as functions at class definition, in a defined order; parameter decorators
// exist only under experimentalDecorators.
import ts from 'typescript';
import { LAB_OPTIONS, typecheck } from '../06-ts-type-system-essentials/typecheck';

// A variable specifier keeps node:fs out of the bundler's static graph (the lab has no @types/node).
const fsSpecifier = 'node:fs';
const { readFileSync } = (await import(fsSpecifier)) as { readFileSync: (path: URL, encoding: 'utf8') => string };

const CART = readFileSync(new URL('./fixtures/section-7/decorated-cart.ts', import.meta.url), 'utf8');
const codes = (code: string, options = LAB_OPTIONS) => typecheck(code, options).map(({ code: diagnostic }) => diagnostic);

/**
 * Vitest's transform leaves standard decorators untouched and Node 24 cannot parse them, so the fixture is lowered with
 * `tsc`'s own emit (target ES2022) and then run in-process.
 */
function runLowered(source: string): string[] {
  const javascript = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  const lines: string[] = [];
  new Function('report', javascript)((line: string) => lines.push(line));
  return lines;
}

const PARAMETER_DECORATOR = `const GREETING = 'greeting';
function Inject(token: string) {
  return (_target: object, _key: string | symbol | undefined, _index: number) => { void token; };
}
export class Greeter {
  constructor(@Inject(GREETING) readonly greeting: string) {}
}`;

describe('Module 07 · section 7', () => {
  it('Section 7: the fixture type-checks as standard decorators (no experimentalDecorators)', () => {
    expect(codes(CART)).toEqual([]);
  });

  it('Section 7: tsc lowers standard decorators to __esDecorate and __runInitializers helpers', () => {
    const output = ts.transpileModule(CART, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
    expect([output.includes('__esDecorate'), output.includes('__runInitializers'), output.includes('@trace')]).toEqual([true, true, false]);
  });

  it('Section 7: decorators run at class definition (expressions top-down, application bottom-up); initializers and wrappers run per instance and call', () => {
    expect(runLowered(CART)).toEqual([
      'evaluate outer',
      'evaluate inner',
      'apply inner to checkout',
      'apply outer to checkout',
      'class defined',
      'initializer inner',
      'initializer outer',
      'init count = 1',
      'set count = 3',
      'call outer',
      'call inner',
      'checkout body',
      'result 3',
    ]);
  });

  it('Section 7: a parameter decorator compiles only with experimentalDecorators (TS1206 otherwise)', () => {
    expect(codes(PARAMETER_DECORATOR)).toEqual([1206]);
    expect(codes(PARAMETER_DECORATOR, { ...LAB_OPTIONS, experimentalDecorators: true })).toEqual([]);
  });
});
