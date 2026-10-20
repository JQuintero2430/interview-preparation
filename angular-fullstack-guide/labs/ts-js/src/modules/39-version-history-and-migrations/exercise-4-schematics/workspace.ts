// Exercise 39.4: the in-memory workspace. It holds the text of the legacy feature in
// labs/angular/src/app/modules/39-version-history-and-migrations/legacy/ (read-only, cross-lab read, plan C10),
// a main.ts that imports its NgModule, and support/run-schematic.ts's minimal angular.json and tsconfig files.
import { minimalWorkspace, type Workspace } from '../support/run-schematic';

/** The collection holding @angular/core 22.2.1's `ng generate` schematics (not its `ng update` migrations). */
export const coreCollection = '@angular/core/schematics/collection.json';

/** The two options the signal-input schematic shares with `signals`; both default to false. */
export interface InputOptions {
  readonly insertTodos?: boolean;
  readonly bestEffortMode?: boolean;
}

/** Both variants: the legacy workspace in, the whole tree after the schematics out. */
export type Modernize = (files: Workspace, options?: InputOptions) => Promise<Workspace>;

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

const legacyRoot = new URL('../../../../../angular/src/app/modules/39-version-history-and-migrations/legacy/', import.meta.url);

/** The three legacy files, in the order the feature reads them. */
export const legacyFiles = ['legacy-orders.service.ts', 'legacy-order-panel.ts', 'legacy-orders.module.ts'] as const;

/** Where the legacy files sit in the in-memory tree. */
export const legacyFolder = '/src/app/legacy/';

/** The panel: the only legacy file with a template, inputs, outputs and a constructor. */
export const panelPath = `${legacyFolder}legacy-order-panel.ts`;

function readLegacy(name: string): string {
  const url = new URL(name, legacyRoot);
  if (!existsSync(url)) throw new Error(`labs/angular/src/app/modules/39-version-history-and-migrations/legacy/${name} does not exist`);
  return readFileSync(url, 'utf8');
}

const mainText = `import { LabM39LegacyOrdersModule } from './app/legacy/legacy-orders.module';

export const feature = LabM39LegacyOrdersModule;
`;

/** A fresh workspace holding the legacy feature's text as it is on disk now. */
export function legacyWorkspace(): Workspace {
  const sources: Record<string, string> = { '/src/main.ts': mainText };
  for (const name of legacyFiles) sources[`${legacyFolder}${name}`] = readLegacy(name);
  return minimalWorkspace(sources);
}
