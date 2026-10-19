// Section 7 claims. Reads the ng-update fields and migration files of the installed 22.2.1 packages in
// labs/angular/node_modules, read-only through support/angular-node-modules.ts (cross-lab read, plan C10).
// No network, git, npm, ng or clock; no internal CLI symbol is imported.
import { installedVersion, jsonEntries, jsonField, readInstalledJson } from '../support/angular-node-modules';

interface MigrationRow {
  name: string;
  version: unknown;
  optional: unknown;
  recommended: unknown;
}

// The migrations a package ships: the `schematics` map of the collection file its `ng-update.migrations` names.
function migrationsOf(collection: unknown): MigrationRow[] {
  return jsonEntries(jsonField(collection, 'schematics')).map(([name, entry]) => ({
    name,
    version: jsonField(entry, 'version'),
    optional: jsonField(entry, 'optional'),
    recommended: jsonField(entry, 'recommended'),
  }));
}

describe('Module 39 · section 7', () => {
  it('Section 7: @angular/core 22.2.1 ships eight migrations, all for 22.0.0 and none optional', () => {
    expect(installedVersion('@angular/core')).toBe('22.2.1');
    const manifest = readInstalledJson('@angular/core/package.json');
    expect(jsonField(manifest, 'ng-update', 'migrations')).toBe('./schematics/migrations.json');

    const migrations = migrationsOf(readInstalledJson('@angular/core/schematics/migrations.json'));
    expect(migrations.map((m) => m.name)).toEqual([
      'change-detection-eager',
      'http-xhr-backend',
      'strict-templates-default',
      'can-match-snapshot-required',
      'incremental-hydration',
      'strict-safe-navigation-narrow',
      'model-output',
      'safe-optional-chaining',
    ]);
    expect(migrations.map((m) => m.version)).toEqual(Array(8).fill('22.0.0'));
    expect(migrations.filter((m) => m.optional === true)).toEqual([]);
  });

  it('Section 7: @angular/cli 22.2.1 takes its migrations from @schematics/angular, two of them optional and one recommended', () => {
    expect(installedVersion('@angular/cli')).toBe('22.2.1');
    expect(installedVersion('@schematics/angular')).toBe('22.2.1');
    const manifest = readInstalledJson('@angular/cli/package.json');
    const collectionPath = jsonField(manifest, 'ng-update', 'migrations');
    expect(collectionPath).toBe('@schematics/angular/migrations/migration-collection.json');
    if (typeof collectionPath !== 'string') throw new Error('ng-update.migrations is not a string');

    const migrations = migrationsOf(readInstalledJson(collectionPath));
    expect(migrations.map((m) => m.name)).toEqual([
      'add-istanbul-instrumenter',
      'use-application-builder',
      'migrate-karma-to-vitest',
      'trust-proxy-headers',
      'update-workspace-config',
    ]);
    expect(migrations.every((m) => m.version === '22.0.0')).toBe(true);
    expect(migrations.filter((m) => m.optional === true).map((m) => m.name)).toEqual(['use-application-builder', 'migrate-karma-to-vitest']);
    expect(migrations.filter((m) => m.optional !== true).map((m) => m.name)).toEqual([
      'add-istanbul-instrumenter',
      'trust-proxy-headers',
      'update-workspace-config',
    ]);
    expect(migrations.filter((m) => m.recommended === true).map((m) => m.name)).toEqual(['use-application-builder']);
  });

  it('Section 7: core, common, router, forms and upgrade are in one package group', () => {
    const group = jsonField(readInstalledJson('@angular/core/package.json'), 'ng-update', 'packageGroup');
    expect(Array.isArray(group)).toBe(true);
    if (!Array.isArray(group)) throw new Error('packageGroup is not a list');
    expect(group).toHaveLength(16);
    for (const name of ['@angular/core', '@angular/common', '@angular/router', '@angular/forms', '@angular/upgrade']) {
      expect(group).toContain(name);
    }
    // the installed members carry the same list, so updating one names all of them; `upgrade` is not installed in the lab
    for (const member of ['common', 'router', 'forms']) {
      expect(jsonField(readInstalledJson(`@angular/${member}/package.json`), 'ng-update', 'packageGroup')).toEqual(group);
    }
  });
});
