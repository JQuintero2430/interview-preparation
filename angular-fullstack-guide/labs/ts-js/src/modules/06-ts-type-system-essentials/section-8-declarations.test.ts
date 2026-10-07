// Section 8 claims: ambient modules, @types versus bundled types, global and module augmentation.
import { LAB_OPTIONS, diagnosticCodes } from './typecheck';

// A variable specifier keeps node:fs out of the bundler's static graph (the lab has no @types/node).
const fsSpecifier = 'node:fs';
const { readFileSync } = (await import(fsSpecifier)) as { readFileSync: (path: URL, encoding: 'utf8') => string };

const LAB_SRC = new URL('../../', import.meta.url).pathname;
const DOM = { ...LAB_OPTIONS, lib: ['esnext', 'dom'] };
const STORE = { '/virtual/store.ts': 'export interface Store { get(key: string): string | undefined }' };
const USE_STORE = "import type { Store } from './store';\nexport const check = (store: Store) => store.has('theme');";

/** Checks `code` as if it were a file inside labs/ts-js/src, so imports resolve against the lab's real node_modules. */
const codesInLab = (code: string, extraFiles: Record<string, string> = {}) =>
  diagnosticCodes('export {};', LAB_OPTIONS, { [`${LAB_SRC}virtual-consumer.ts`]: code, ...extraFiles });

describe('Module 06 · section 8', () => {
  it('Section 8: an ambient module declaration types a package that ships no types (TS2345 when misused)', () => {
    const declarations = { '/virtual/legacy.d.ts': "declare module 'legacy-charts' { export function draw(id: string): void; }" };
    expect(diagnosticCodes("import { draw } from 'legacy-charts';\ndraw('chart');", LAB_OPTIONS, declarations)).toEqual([]);
    expect(diagnosticCodes("import { draw } from 'legacy-charts';\ndraw(1);", LAB_OPTIONS, declarations)).toEqual([2345]);
    expect(diagnosticCodes("import { draw } from 'legacy-charts';\ndraw('chart');")).toEqual([2307]);
  });

  it('Section 8: a JavaScript package without declarations is TS7016, and a shorthand ambient module makes it any', () => {
    const usePicomatch = "import picomatch from 'picomatch';\nexport const match = picomatch;";
    expect(codesInLab(usePicomatch)).toEqual([7016]);
    expect(codesInLab(usePicomatch, { '/virtual/shims.d.ts': "declare module 'picomatch';" })).toEqual([]);
  });

  it('Section 8: chai ships no types, so its import resolves to @types/chai; vitest ships its own through the exports types condition', () => {
    expect(codesInLab("import { expect } from 'chai';\nexport const check = expect;")).toEqual([]);
    const chai = JSON.parse(readFileSync(new URL('../../../node_modules/chai/package.json', import.meta.url), 'utf8')) as Record<string, unknown>;
    const vitest = JSON.parse(readFileSync(new URL('../../../node_modules/vitest/package.json', import.meta.url), 'utf8')) as {
      exports: Record<string, { import: { types: string } }>;
    };
    expect([chai['types'], chai['typings'], vitest.exports['.']?.import.types]).toEqual([undefined, undefined, './dist/index.d.ts']);
  });

  it('Section 8: declare global adds to Window only from a module file (TS2669 otherwise), and a script .d.ts merges directly', () => {
    const useConfig = 'export const url = window.appConfig.apiUrl;';
    const windowConfig = 'interface Window { appConfig: { apiUrl: string } }';
    expect(diagnosticCodes(useConfig, DOM)).toEqual([2339]);
    expect(diagnosticCodes(useConfig, DOM, { '/virtual/globals.d.ts': `export {};\ndeclare global { ${windowConfig} }` })).toEqual([]);
    expect(diagnosticCodes(useConfig, DOM, { '/virtual/globals.d.ts': `declare global { ${windowConfig} }` })).toEqual([2669, 2339]);
    expect(diagnosticCodes(useConfig, DOM, { '/virtual/globals.d.ts': windowConfig })).toEqual([]);
  });

  it('Section 8: module augmentation merges a new member into an exported interface (TS2339 without it)', () => {
    expect(diagnosticCodes(USE_STORE, LAB_OPTIONS, STORE)).toEqual([2339]);
    const augmentation = { '/virtual/store-has.ts': "export {};\ndeclare module './store' { interface Store { has(key: string): boolean } }" };
    expect(diagnosticCodes(USE_STORE, LAB_OPTIONS, { ...STORE, ...augmentation })).toEqual([]);
  });

  it('Section 8: declarations a package ships win over @types, and an ambient declare module wins over both', () => {
    const community = { '/virtual/node_modules/@types/pkg/index.d.ts': 'export const community: number;' };
    const own = { '/virtual/node_modules/pkg/package.json': '{"name":"pkg","types":"./index.d.ts"}', '/virtual/node_modules/pkg/index.d.ts': 'export const own: string;' };
    const ambient = { '/virtual/ambient.d.ts': "declare module 'pkg' { export const ambient: boolean; }" };
    const use = (name: string) => `import { ${name} } from 'pkg';\nexport const value = ${name};`;
    expect(diagnosticCodes(use('community'), LAB_OPTIONS, community)).toEqual([]);
    expect([diagnosticCodes(use('own'), LAB_OPTIONS, { ...community, ...own }), diagnosticCodes(use('community'), LAB_OPTIONS, { ...community, ...own })]).toEqual([[], [2305]]);
    const all = { ...community, ...own, ...ambient };
    expect([diagnosticCodes(use('ambient'), LAB_OPTIONS, all), diagnosticCodes(use('own'), LAB_OPTIONS, all)]).toEqual([[], [2305]]);
  });
});
