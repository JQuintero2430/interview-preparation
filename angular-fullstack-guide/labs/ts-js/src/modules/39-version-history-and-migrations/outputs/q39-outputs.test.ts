// Output answers of the module 39 question bank. Q39.14 runs our selector (concepts/select-migrations.ts, which mirrors
// executeMigrations in @angular/cli 22.2.1 and is not the CLI's own code) over the migration collection that
// `@angular/cli` names in its `ng-update.migrations` field, read from labs/angular/node_modules, read-only through
// support/angular-node-modules.ts (cross-lab read, plan C10). No network, git, npm, ng or clock.
import { installedVersion, jsonEntries, jsonField, readInstalledJson } from '../support/angular-node-modules';
import { selectMigrations, type MigrationEntry } from '../concepts/select-migrations';

// The `schematics` map of a migration collection as our selector's entries; fields that are not the expected type are dropped.
function entriesOf(collection: unknown): MigrationEntry[] {
  return jsonEntries(jsonField(collection, 'schematics')).map(([name, entry]) => {
    const version = jsonField(entry, 'version');
    return {
      name,
      version: typeof version === 'string' ? version : '',
      optional: jsonField(entry, 'optional') === true,
      recommended: jsonField(entry, 'recommended') === true,
      hidden: jsonField(entry, 'hidden') === true,
      private: jsonField(entry, 'private') === true,
    };
  });
}

// The collection `ng update` reads for @angular/cli itself: the path in the package's own `ng-update.migrations`.
function cliMigrations(): MigrationEntry[] {
  expect(installedVersion('@angular/cli')).toBe('22.2.1');
  const collectionPath = jsonField(readInstalledJson('@angular/cli/package.json'), 'ng-update', 'migrations');
  if (typeof collectionPath !== 'string') throw new Error('ng-update.migrations is not a string');
  expect(collectionPath).toBe('@schematics/angular/migrations/migration-collection.json');
  return entriesOf(readInstalledJson(collectionPath));
}

describe('Module 39 · question bank outputs', () => {
  it('Q39.14 our selector runs three migrations unasked and offers two, with use-application-builder pre-selected', () => {
    const entries = cliMigrations();
    expect(entries.every((entry) => entry.version === '22.0.0')).toBe(true);

    const selection = selectMigrations(entries, '21.2.3', '22.2.1');
    expect(selection.required).toEqual(['add-istanbul-instrumenter', 'trust-proxy-headers', 'update-workspace-config']);
    expect(selection.optional).toEqual([
      { name: 'migrate-karma-to-vitest', checked: false },
      { name: 'use-application-builder', checked: true },
    ]);
    expect(selection.optional.filter((item) => item.checked).map((item) => item.name)).toEqual(['use-application-builder']);

    // any 21.x start selects the same list, and a start inside 22.0.0 or later selects nothing
    expect(selectMigrations(entries, '21.0.0', '22.2.1')).toEqual(selection);
    expect(selectMigrations(entries, '22.0.0', '22.2.1')).toEqual({ required: [], optional: [] });
  });

  it('Q39.14 the ties among the 22.0.0 entries follow name order, not the order of the collection file', () => {
    const entries = cliMigrations();
    expect(entries.filter((entry) => entry.optional === true).map((entry) => entry.name)).toEqual([
      'use-application-builder',
      'migrate-karma-to-vitest',
    ]);
    expect(selectMigrations(entries, '21.2.3', '22.2.1').optional.map((item) => item.name)).toEqual([
      'migrate-karma-to-vitest',
      'use-application-builder',
    ]);
  });
});
