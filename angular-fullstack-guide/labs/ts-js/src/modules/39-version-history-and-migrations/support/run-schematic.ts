// Runs one @angular/core schematic against an in-memory workspace, with the packages read from labs/angular/node_modules
// (cross-lab read, plan C10). Nothing touches the disk: files go into a HostTree and come back as a path-to-text map.
// The packages are CommonJS, so they load through createRequire rooted at labs/angular/package.json; every value that
// comes back is `unknown` and is narrowed by a guard, never cast.

interface NodeModuleApi {
  createRequire(from: URL): unknown;
}

interface TestTree {
  readonly files: string[];
  readContent(path: string): string;
}

interface Runner {
  runSchematic(name: string, options: object, tree: unknown): Promise<unknown>;
}

type RunnerConstructor = new (collectionName: string, collectionPath: string) => Runner;
type TreeConstructor = new () => { create(path: string, content: string): unknown };

type Resolver = ((id: string) => unknown) & { resolve(id: string): string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isFunction(value: unknown): value is (...args: never[]) => unknown {
  return typeof value === 'function';
}

function isNodeModuleApi(value: unknown): value is NodeModuleApi {
  return isRecord(value) && isFunction(value['createRequire']);
}

function isResolver(value: unknown): value is Resolver {
  return isFunction(value) && 'resolve' in value && isFunction(value.resolve);
}

function isTestTree(value: unknown): value is TestTree {
  return isRecord(value) && Array.isArray(value['files']) && isFunction(value['readContent']);
}

// A variable specifier keeps node:module out of the bundler's static graph (the lab has no @types/node).
const moduleSpecifier = 'node:module';
const loadedModule: unknown = await import(moduleSpecifier);
if (!isNodeModuleApi(loadedModule)) throw new Error('node:module is unavailable');

const angularPackage = new URL('../../../../../angular/package.json', import.meta.url);
const created: unknown = loadedModule.createRequire(angularPackage);
if (!isResolver(created)) throw new Error('createRequire returned no resolver');
const angularRequire = created;

function load(id: string): unknown {
  try {
    return angularRequire(id);
  } catch (error) {
    throw new Error(`cannot load ${id}: run \`npm ci\` in labs/angular first (${String(error)})`);
  }
}

function member(moduleExports: unknown, name: string): unknown {
  return isRecord(moduleExports) ? moduleExports[name] : undefined;
}

function constructorOf<T>(moduleExports: unknown, name: string, guard: (value: unknown) => value is T): T {
  const found = member(moduleExports, name);
  if (!guard(found)) throw new Error(`${name} is not exported where expected`);
  return found;
}

const isRunnerConstructor = (value: unknown): value is RunnerConstructor => isFunction(value);
const isTreeConstructor = (value: unknown): value is TreeConstructor => isFunction(value);

// The packages' `exports` map appends `.js` to wildcard subpaths, so a collection file cannot be resolved directly:
// resolve `<package>/package.json` (always exported) and join the rest of the path to its folder.
function collectionPath(collectionFile: string): string {
  const parts = collectionFile.split('/');
  const nameLength = collectionFile.startsWith('@') ? 2 : 1;
  const packageJson = angularRequire.resolve(`${parts.slice(0, nameLength).join('/')}/package.json`);
  return packageJson.slice(0, packageJson.length - 'package.json'.length) + parts.slice(nameLength).join('/');
}

/** The in-memory workspace: a path (for example `/angular.json`) mapped to its text. */
export type Workspace = Readonly<Record<string, string>>;

/**
 * Runs one schematic of `collectionFile` (for example `@angular/core/schematics/migrations.json`) on `files` and returns every
 * file of the tree afterwards, so a test compares before and after without reading a tree class.
 */
export async function runSchematic(
  collectionFile: string,
  schematicName: string,
  files: Workspace,
  options: object = {},
): Promise<Record<string, string>> {
  const RunnerClass = constructorOf(load('@angular-devkit/schematics/testing'), 'SchematicTestRunner', isRunnerConstructor);
  const TreeClass = constructorOf(load('@angular-devkit/schematics'), 'HostTree', isTreeConstructor);
  const tree = new TreeClass();
  for (const [path, content] of Object.entries(files)) tree.create(path, content);

  const runner = new RunnerClass('module-39-probe', collectionPath(collectionFile));
  const result = await runner.runSchematic(schematicName, options, tree);
  if (!isTestTree(result)) throw new Error('the schematic runner returned no tree');
  return Object.fromEntries(result.files.map((path) => [path, result.readContent(path)]));
}

/** Runs one migration of `@angular/core` 22.x (its `migrations.json`) on an in-memory workspace. */
export function runCoreMigration(name: string, files: Workspace): Promise<Record<string, string>> {
  return runSchematic('@angular/core/schematics/migrations.json', name, files);
}

/** A minimal workspace: one `@angular/build:application` project named `app` plus the given source files. */
export function minimalWorkspace(sources: Workspace, tsconfig: object = {}): Record<string, string> {
  return {
    '/angular.json': JSON.stringify({
      version: 1,
      projects: {
        app: {
          root: '',
          sourceRoot: 'src',
          projectType: 'application',
          architect: { build: { builder: '@angular/build:application', options: { tsConfig: 'tsconfig.app.json' } } },
        },
      },
    }),
    '/tsconfig.json': JSON.stringify({ compilerOptions: { strict: true, target: 'ES2022', module: 'preserve' }, ...tsconfig }),
    '/tsconfig.app.json': JSON.stringify({ extends: './tsconfig.json', files: ['src/main.ts'], include: ['src/**/*.ts'] }),
    ...sources,
  };
}
