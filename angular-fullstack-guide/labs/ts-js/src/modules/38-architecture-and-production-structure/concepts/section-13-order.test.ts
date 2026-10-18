// Section 13 claim: entry points are built dependencies first, and a cycle stops the sort.
// The build order inside ng-packagr is read, not run (package.transform.js, scheduleEntryPoints);
// these tests run our sort (toposort.ts) on the built library's import graph and on a fixture.
// Needs `npx ng build ui-lib` in labs/angular first.
import type { ProjectGraph } from './affected';
import { toposort } from './toposort';

// A variable specifier keeps node:fs out of the bundler's static graph (the lab has no @types/node).
const fsSpecifier = 'node:fs';
const { readFileSync, existsSync } = (await import(fsSpecifier)) as {
  readFileSync: (path: URL, encoding: 'utf8') => string;
  existsSync: (path: URL) => boolean;
};

const distRoot = new URL('../../../../../angular/dist/ui-lib/', import.meta.url);

interface ExportTarget {
  types?: string;
  default?: string;
}

function readDist(path: string): string {
  if (!existsSync(new URL('package.json', distRoot))) {
    throw new Error('run `npx ng build ui-lib` in labs/angular first');
  }
  return readFileSync(new URL(path, distRoot), 'utf8');
}

function importSpecifiers(source: string): string[] {
  return [...source.matchAll(/(?:from|import)\s*['"]([^'"]+)['"]/g)].map((match) => match[1] ?? '');
}

// Entry point id -> the other entry points its bundle or types file imports.
function entryPointGraph(): ProjectGraph {
  const manifest: { name: string; exports: Record<string, ExportTarget> } = JSON.parse(readDist('package.json'));
  // Exercise 38.2's entry points (./ex2-*) share the library; this section reads only its own.
  const entries = Object.entries(manifest.exports).filter(
    ([subpath]) => subpath !== './package.json' && !subpath.startsWith('./ex2-'),
  );
  const idOf = (subpath: string): string => (subpath === '.' ? manifest.name : `${manifest.name}/${subpath.slice(2)}`);
  const idSet = new Set(entries.map(([subpath]) => idOf(subpath)));
  return Object.fromEntries(
    entries.map(([subpath, target]) => {
      const files = [target.types ?? 'missing-types', target.default ?? 'missing-bundle'];
      const imported = files.flatMap((file) => importSpecifiers(readDist(file))).filter((spec) => idSet.has(spec));
      return [idOf(subpath), [...new Set(imported)]];
    }),
  );
}

describe('Module 38 · section 13', () => {
  it("Section 13: the library's entry points are built dependencies first", () => {
    const graph = entryPointGraph();
    // In this library the testing entry point imports nothing from the root: no edge, no forced order.
    expect(graph).toEqual({ 'ui-lib': [], 'ui-lib/testing': [] });
    expect(toposort(graph).sort()).toEqual(['ui-lib', 'ui-lib/testing']);
    // Had testing imported the root, the root would come first.
    expect(toposort({ 'ui-lib/testing': ['ui-lib'], 'ui-lib': [] })).toEqual(['ui-lib', 'ui-lib/testing']);
  });

  it("Section 13: a cycle between two entry points is reported by our topological sort", () => {
    const cycle: ProjectGraph = { 'ui-lib/a': ['ui-lib/b'], 'ui-lib/b': ['ui-lib/a'], 'ui-lib': [] };
    expect(() => toposort(cycle)).toThrow('Dependency cycle among: ui-lib/a, ui-lib/b');
  });
});
