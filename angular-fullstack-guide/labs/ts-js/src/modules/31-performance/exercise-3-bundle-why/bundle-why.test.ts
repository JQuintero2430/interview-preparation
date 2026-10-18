import { importChainBfs, importChainReverse, initialBytesByPackage, type ChainFinder } from './bundle-why';
import type { Metafile } from './metafile';

// A variable specifier keeps node:fs out of the bundler's static graph (the lab has no @types/node).
const fsSpecifier = 'node:fs';
const fs: unknown = await import(fsSpecifier);

function isMetafile(value: unknown): value is Metafile {
  return (
    typeof value === 'object' &&
    value !== null &&
    'inputs' in value &&
    'outputs' in value &&
    typeof value.inputs === 'object' &&
    typeof value.outputs === 'object'
  );
}

function loadFixture(): Metafile {
  if (typeof fs !== 'object' || fs === null || !('readFileSync' in fs) || typeof fs.readFileSync !== 'function') {
    throw new Error('node:fs is not available');
  }
  const text: unknown = fs.readFileSync(new URL('./fixtures/browser-stats.fixture.json', import.meta.url), 'utf8');
  const parsed: unknown = typeof text === 'string' ? JSON.parse(text) : null;
  if (!isMetafile(parsed)) throw new Error('the fixture is not a metafile');
  return parsed;
}

const meta = loadFixture();
const INITIAL_FILES = ['main-AAAA1111.js', 'styles-CCCC3333.css'];
const MAIN = 'src/main.ts';
const CORE = 'node_modules/@angular/core/fesm2022/core.mjs';
const ROUTER = 'node_modules/@angular/router/fesm2022/router.mjs';
const OBSERVABLE = 'node_modules/rxjs/dist/esm/internal/Observable.js';
const CHART = 'node_modules/chart.js/dist/chart.js';
const ADMIN = 'src/app/admin/admin.ts';

const variants: [string, ChainFinder][] = [
  ['breadth-first search over imports', importChainBfs],
  ['reverse-importer index', importChainReverse],
];

describe.each(variants)('E31.3 bundle why (%s)', (_name, chain) => {
  it('sums the bytes each package contributes to the initial files', () => {
    const totals = initialBytesByPackage(meta, INITIAL_FILES);
    expect(totals['@angular/core']).toBe(61_200);
    expect(totals['@angular/router']).toBe(18_400);
    expect(totals['rxjs']).toBe(4_100);
  });

  it('attributes app code to the app, not to a package', () => {
    const totals = initialBytesByPackage(meta, INITIAL_FILES);
    expect(totals['(app)']).toBe(2_150);
    expect(Object.keys(totals).sort()).toEqual(['(app)', '@angular/core', '@angular/router', 'rxjs']);
  });

  it('finds the shortest import chain from main to a module', () => {
    expect(chain(meta, MAIN, CORE)).toEqual([MAIN, 'src/app/app.ts', CORE]);
    expect(chain(meta, MAIN, ROUTER)).toEqual([MAIN, 'src/app/app.config.ts', ROUTER]);
    expect(chain(meta, MAIN, OBSERVABLE)).toEqual([MAIN, 'src/app/app.ts', CORE, OBSERVABLE]);
  });

  it('returns null when the module is not reachable', () => {
    expect(chain(meta, 'src/app/home.ts', 'src/app/app.ts')).toBeNull();
    expect(chain(meta, MAIN, 'src/app/missing.ts')).toBeNull();
  });

  it('ignores dynamic imports when explaining the initial chunk', () => {
    const lazyEdge = meta.inputs['src/app/app.routes.ts']?.imports.find((edge) => edge.path === ADMIN);
    expect(lazyEdge?.kind).toBe('dynamic-import');
    expect(chain(meta, MAIN, ADMIN)).toBeNull();
    expect(chain(meta, MAIN, CHART)).toBeNull();
    expect(Object.keys(initialBytesByPackage(meta, INITIAL_FILES))).not.toContain('chart.js');
  });
});
