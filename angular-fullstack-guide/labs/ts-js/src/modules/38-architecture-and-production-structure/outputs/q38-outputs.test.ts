// Q38.13 output: the fields of dist/ui-lib/package.json after `ng build ui-lib`, compared with the source manifest.
// Needs `npx ng build ui-lib` in labs/angular first.

// A variable specifier keeps node:fs out of the bundler's static graph (the lab has no @types/node).
const fsSpecifier = 'node:fs';
const { readFileSync, existsSync } = (await import(fsSpecifier)) as {
  readFileSync: (path: URL, encoding: 'utf8') => string;
  existsSync: (path: URL) => boolean;
};

const angularRoot = new URL('../../../../../angular/', import.meta.url);
const distManifest = new URL('dist/ui-lib/package.json', angularRoot);
const sourceManifest = new URL('projects/ui-lib/package.json', angularRoot);

type Manifest = Record<string, unknown> & { exports: Record<string, { types?: string; default?: string } | string> };

function readDist(path: string): string {
  if (!existsSync(distManifest)) {
    throw new Error('run `npx ng build ui-lib` in labs/angular first');
  }
  return readFileSync(new URL(path, new URL('dist/ui-lib/', angularRoot)), 'utf8');
}

function readJson(url: URL): Manifest {
  if (!existsSync(distManifest)) {
    throw new Error('run `npx ng build ui-lib` in labs/angular first');
  }
  return JSON.parse(readFileSync(url, 'utf8'));
}

describe('Module 38 · output questions', () => {
  it('Q38.13: the built package.json keeps the source fields and adds module, typings, type and exports', () => {
    const source = readJson(sourceManifest);
    const built = readJson(distManifest);

    // Every source field survives with its value: nothing is removed from this library's manifest.
    for (const [key, value] of Object.entries(source)) {
      expect(built[key]).toEqual(value);
    }
    expect(built['name']).toBe('ui-lib');
    expect(built['sideEffects']).toBe(false);
    expect(built['dependencies']).toEqual({ tslib: expect.any(String) });

    // Fields ng-packagr adds, absent from the source.
    for (const key of ['module', 'typings', 'type', 'exports']) {
      expect(source).not.toHaveProperty(key);
    }
    expect(built['module']).toBe('fesm2022/ui-lib.mjs');
    expect(built['typings']).toBe('types/ui-lib.d.ts');
    expect(built['type']).toBe('module');

    const exportKeys = Object.keys(built.exports);
    expect(exportKeys).toEqual(expect.arrayContaining(['./package.json', '.', './testing']));
    expect(built.exports['.']).toEqual({ types: './types/ui-lib.d.ts', default: './fesm2022/ui-lib.mjs' });
  });

  it('Q38.16: an internal component is compiled into the bundle but absent from the root types; testing and exports list only their own names', () => {
    const exportsMap: Record<string, { types?: string; default?: string }> = JSON.parse(readDist('package.json')).exports;
    // Exercise 38.2's entry points (./ex2-*) share the library; this question reads only the root and testing.
    expect(Object.keys(exportsMap).filter((key) => !key.startsWith('./ex2-')).sort()).toEqual(['.', './package.json', './testing']);

    const rootTypes = readDist(exportsMap['.']?.types ?? 'missing-root-types');
    expect(rootTypes).toContain('UiBadge');
    expect(rootTypes).not.toContain('UiBadgeDot');
    // Unexported, not removed: the component is compiled into the root bundle.
    expect(readDist(exportsMap['.']?.default ?? 'missing-root-bundle')).toContain('UiBadgeDot');

    const testingTypes = readDist(exportsMap['./testing']?.types ?? 'missing-testing-types');
    expect(testingTypes).toContain('UiBadgeHarnessLite');
    expect(testingTypes).not.toContain('UiBadgeDot');
  });
});
