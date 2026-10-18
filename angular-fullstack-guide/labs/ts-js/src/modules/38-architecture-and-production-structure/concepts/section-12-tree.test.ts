// Section 12 claim: every folder in the sample tree is one of the kinds the folder table documents (read-only scan).
import { allowedTypes, type LibraryType } from './rules';

// A variable specifier keeps node:fs out of the bundler's static graph (the lab has no @types/node).
const fsSpecifier = 'node:fs';
const { readdirSync } = (await import(fsSpecifier)) as {
  readdirSync: (path: URL, options: { withFileTypes: true }) => { name: string; isDirectory(): boolean }[];
};

const sampleApp = new URL(
  '../../../../../angular/src/app/modules/38-architecture-and-production-structure/sample-app/',
  import.meta.url,
);

type FolderKind = 'core' | 'shared' | 'styles' | 'features' | 'domain' | LibraryType;

// One entry per row of the section's folder table.
const documented: Record<string, FolderKind> = {
  core: 'core',
  features: 'features',
  'features/catalog': 'domain',
  'features/catalog/data-access': 'data-access',
  'features/catalog/feature': 'feature',
  'features/catalog/ui': 'ui',
  'features/orders': 'domain',
  'features/orders/data-access': 'data-access',
  'features/orders/feature': 'feature',
  'features/orders/ui': 'ui',
  shared: 'shared',
  'shared/ui': 'ui',
  'shared/util': 'util',
  styles: 'styles',
};

function foldersUnder(dir: URL, prefix = ''): string[] {
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => [
      `${prefix}${entry.name}`,
      ...foldersUnder(new URL(`${entry.name}/`, dir), `${prefix}${entry.name}/`),
    ]);
}

const isLibraryType = (kind: FolderKind): kind is LibraryType => kind in allowedTypes;

describe('Module 38 · section 12', () => {
  it('Section 12: every folder in the sample tree is one of the documented kinds', () => {
    expect(foldersUnder(sampleApp).sort()).toEqual(Object.keys(documented).sort());

    // A library-type folder is named after its type, so the section 4 rule table applies to it by name.
    const misnamed = Object.entries(documented)
      .filter(([, kind]) => isLibraryType(kind))
      .filter(([folder, kind]) => folder.split('/').at(-1) !== kind);
    expect(misnamed).toEqual([]);
  });
});
