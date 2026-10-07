// Q07.15–Q07.20. Q07.15 type-checks its fixture, lowers it with ts.transpileModule (Vitest cannot run standard decorators) and runs it;
// Q07.17 imports its fixture. The Angular questions (Q07.18–Q07.20) are covered by the module 07 Angular specs.
import ts from 'typescript';
import { typecheck } from '../../modules/06-ts-type-system-essentials/typecheck';
import { lines } from './fixtures/q07-17';

// A variable specifier keeps node:fs out of the bundler's static graph (the lab has no @types/node).
const fsSpecifier = 'node:fs';
const { readFileSync } = (await import(fsSpecifier)) as { readFileSync: (path: URL, encoding: 'utf8') => string };

const fixture = (name: string) => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8');

describe('Module 07 · Output questions: decorators and Zod', () => {
  it('Q07.15 decorator expressions evaluate top-down, apply bottom-up, initializers run on construction, calls go outer to inner', () => {
    const source = fixture('q07-15.ts');
    expect(typecheck(source).map(({ code }) => code)).toEqual([]);
    const js = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
    const logged: string[] = [];
    new Function('log', js)((line: string) => logged.push(line));
    expect(logged).toEqual(['evaluate A', 'evaluate B', 'apply B', 'apply A', 'defined', 'init B', 'init A', 'call A', 'call B', 'body']);
  });

  it('Q07.15 evidence: under experimentalDecorators the same decorators do not type-check (TS1241, TS1270 on each)', () => {
    const options = { strict: true, target: 'es2022', lib: ['esnext'], experimentalDecorators: true };
    expect(typecheck(fixture('q07-15.ts'), options).map(({ line, code }) => `line ${line}: TS${code}`)).toEqual([
      'line 19: TS1241',
      'line 19: TS1270',
      'line 20: TS1241',
      'line 20: TS1270',
    ]);
  });

  it('Q07.17 parse strips the unknown key, safeParse reports the non-integer, strictObject reports unrecognized_keys', () => {
    expect(lines).toEqual(['{"id":"u-1","age":30}', 'Invalid input: expected int, received number', 'unrecognized_keys']);
  });
});
