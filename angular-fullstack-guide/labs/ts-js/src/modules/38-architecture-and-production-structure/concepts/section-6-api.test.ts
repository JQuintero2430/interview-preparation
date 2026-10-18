// Section 6 claim: the public API is what the root types file and the generated `exports` map expose.
// Needs `npx ng build ui-lib` in labs/angular first.

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

function readExports(): Record<string, ExportTarget> {
  const manifest: { exports: Record<string, ExportTarget> } = JSON.parse(readDist('package.json'));
  return manifest.exports;
}

describe('Module 38 · section 6', () => {
  it('Section 6: exports lists the package, the root and the testing subpath only', () => {
    // Exercise 38.2's entry points (./ex2-*) share the library; this section reads only its own.
    const keys = Object.keys(readExports()).filter((key) => !key.startsWith('./ex2-'));
    expect(keys.sort()).toEqual(['.', './package.json', './testing']);
  });

  it("Section 6: an internal helper's name is absent from the root types file", () => {
    const rootTarget = readExports()['.'];
    const rootTypes = readDist(rootTarget?.types ?? 'missing-root-types');
    expect(rootTypes).toContain('UiBadge');
    expect(rootTypes).not.toContain('formatCount');
    // The helper is still compiled into the bundle: unexported, not removed.
    expect(readDist(rootTarget?.default ?? 'missing-root-bundle')).toContain('formatCount');
  });

  it('Section 6: the testing entry point has its own bundle and types file', () => {
    const root = readExports()['.'];
    const testing = readExports()['./testing'];
    expect(testing?.default).toBeDefined();
    expect(testing?.default).not.toBe(root?.default);
    expect(testing?.types).not.toBe(root?.types);
    expect(readDist(testing?.default ?? 'missing-testing-bundle')).toContain('UiBadgeHarnessLite');
    expect(readDist(testing?.types ?? 'missing-testing-types')).toContain('UiBadgeHarnessLite');
    expect(readDist(root?.types ?? 'missing-root-types')).not.toContain('UiBadgeHarnessLite');
  });
});
