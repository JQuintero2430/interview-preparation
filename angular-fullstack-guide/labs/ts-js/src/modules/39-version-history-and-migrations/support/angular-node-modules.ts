// Read-only access to labs/angular/node_modules for the module 39 tests (cross-lab read, plan C10).
// Paths are relative to that folder, for example '@angular/core/package.json'. Nothing here writes, and a test that
// cannot find the folder fails with "run `npm ci` in labs/angular first" instead of skipping.

interface NodeFs {
  existsSync(path: URL): boolean;
  readdirSync(path: URL): string[];
  readFileSync(path: URL, encoding: 'utf8'): string;
}

function isNodeFs(value: unknown): value is NodeFs {
  return typeof value === 'object' && value !== null && 'existsSync' in value && 'readdirSync' in value && 'readFileSync' in value;
}

// A variable specifier keeps node:fs out of the bundler's static graph (the lab has no @types/node); the guard avoids a cast.
const fsSpecifier = 'node:fs';
const loadedFs: unknown = await import(fsSpecifier);
if (!isNodeFs(loadedFs)) throw new Error('node:fs is unavailable');
const { existsSync, readdirSync, readFileSync } = loadedFs;

const root = new URL('../../../../../angular/node_modules/', import.meta.url);

function locate(relativePath: string): URL {
  if (!existsSync(root)) throw new Error('run `npm ci` in labs/angular first');
  const url = new URL(relativePath, root);
  if (!existsSync(url)) throw new Error(`labs/angular/node_modules/${relativePath} does not exist: run \`npm ci\` in labs/angular first`);
  return url;
}

/** The text of one installed file. */
export function readInstalledText(relativePath: string): string {
  return readFileSync(locate(relativePath), 'utf8');
}

/** One installed JSON file, parsed and left as `unknown` for the caller to narrow. */
export function readInstalledJson(relativePath: string): unknown {
  return JSON.parse(readInstalledText(relativePath));
}

/** The entry names of one installed folder. */
export function listInstalledDir(relativePath: string): string[] {
  return readdirSync(locate(relativePath.endsWith('/') ? relativePath : `${relativePath}/`));
}

/** Follows object keys from `value` (`jsonField(manifest, 'ng-update', 'migrations')`); `undefined` when a step is missing. */
export function jsonField(value: unknown, ...keys: string[]): unknown {
  let current: unknown = value;
  for (const key of keys) {
    if (typeof current !== 'object' || current === null) return undefined;
    current = Object.entries(current).find(([name]) => name === key)?.[1];
  }
  return current;
}

/** The `version` field of an installed package, for example `installedVersion('@angular/core')`. */
export function installedVersion(packageName: string): string | undefined {
  const version = jsonField(readInstalledJson(`${packageName}/package.json`), 'version');
  return typeof version === 'string' ? version : undefined;
}

/** The entries of an object as [name, value] pairs, or an empty list when `value` is not an object. */
export function jsonEntries(value: unknown): [string, unknown][] {
  return typeof value === 'object' && value !== null ? Object.entries(value) : [];
}
