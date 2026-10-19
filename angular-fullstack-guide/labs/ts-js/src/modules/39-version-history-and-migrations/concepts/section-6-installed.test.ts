// Section 6 claim. Reads package.json files of the installed Angular packages in labs/angular/node_modules, read-only
// (cross-lab read, plan C10), and compares them with the 22.0.x row of angular.dev "Version compatibility"
// (adev/src/content/reference/versions.md on angular/angular main, read 2026-10-18). No network, git, npm or clock.

interface NodeFs {
  existsSync(path: URL): boolean;
  readFileSync(path: URL, encoding: 'utf8'): string;
}

function isNodeFs(value: unknown): value is NodeFs {
  return typeof value === 'object' && value !== null && 'existsSync' in value && 'readFileSync' in value;
}

// A variable specifier keeps node:fs out of the bundler's static graph (the lab has no @types/node); the guard avoids a cast.
const fsSpecifier = 'node:fs';
const loadedFs: unknown = await import(fsSpecifier);
if (!isNodeFs(loadedFs)) throw new Error('node:fs is unavailable');
const { existsSync, readFileSync } = loadedFs;

const angularDir = new URL('../../../../../angular/node_modules/@angular/', import.meta.url);

// The 22.0.x row of the docs table, as written there (columns Node.js and TypeScript).
const docsRow = { node: '^22.22.3 || ^24.15.0 || ^26.0.0', typescript: '>=6.0.0 <6.1.0' };

function manifestOf(pkg: string): object {
  const file = new URL(`${pkg}/package.json`, angularDir);
  if (!existsSync(file)) throw new Error('run `npm ci` in labs/angular first');
  const manifest: unknown = JSON.parse(readFileSync(file, 'utf8'));
  if (typeof manifest !== 'object' || manifest === null) throw new Error(`${pkg}/package.json is not an object`);
  return manifest;
}

function stringField(manifest: object, group: string, key: string): string | undefined {
  const section: unknown = Object.entries(manifest).find(([name]) => name === group)?.[1];
  if (typeof section !== 'object' || section === null) return undefined;
  const value: unknown = Object.entries(section).find(([name]) => name === key)?.[1];
  return typeof value === 'string' ? value : undefined;
}

function versionOf(manifest: object): string | undefined {
  const value: unknown = Object.entries(manifest).find(([name]) => name === 'version')?.[1];
  return typeof value === 'string' ? value : undefined;
}

// ">=6.0 <6.1" and ">=6.0.0 <6.1.0" are the same range: pad every two-part version to three parts.
const padVersions = (range: string): string => range.replace(/(\d+)\.(\d+)(?![.\d])/g, '$1.$2.0');

describe('Module 39 · section 6', () => {
  it('Section 6: the installed 22.2.1 packages require the Node and TypeScript ranges of the 22.0.x compatibility row', () => {
    const core = manifestOf('core');
    const compilerCli = manifestOf('compiler-cli');
    expect(versionOf(core)).toBe('22.2.1');
    expect(versionOf(compilerCli)).toBe('22.2.1');

    // TypeScript: the package writes the same range with two-part bounds; the docs write three-part bounds.
    const typescript = stringField(compilerCli, 'peerDependencies', 'typescript');
    expect(typescript).toBe('>=6.0 <6.1');
    expect(padVersions(typescript ?? '')).toBe(docsRow.typescript);

    // Node: both packages say `>=26.0.0` for the newest line; the docs table says `^26.0.0` (plan C12).
    const packageNode = stringField(core, 'engines', 'node');
    expect(packageNode).toBe('^22.22.3 || ^24.15.0 || >=26.0.0');
    expect(stringField(compilerCli, 'engines', 'node')).toBe(packageNode);
    expect(packageNode).not.toBe(docsRow.node);
    expect(packageNode?.replace('>=26.0.0', '^26.0.0')).toBe(docsRow.node);
  });
});
