// Output answers of the module 39 question bank. Q39.14 runs our selector (concepts/select-migrations.ts, which mirrors
// executeMigrations in @angular/cli 22.2.1 and is not the CLI's own code) over the migration collection that
// `@angular/cli` names in its `ng-update.migrations` field, read from labs/angular/node_modules, read-only through
// support/angular-node-modules.ts (cross-lab read, plan C10). Q39.22 and Q39.23 run @angular/core 22.2.1 migrations on an
// in-memory workspace through support/run-schematic.ts (no disk). Q39.24 runs our classifier (concepts/update-guide.ts, which
// mirrors showUpdatePath and is not the Guide) on the invented steps of update-guide-steps.ts. No network, git, npm, ng or clock.
import { installedVersion, jsonEntries, jsonField, readInstalledJson } from '../support/angular-node-modules';
import { selectMigrations, type MigrationEntry } from '../concepts/select-migrations';
import { classifySteps } from '../concepts/update-guide';
import { minimalWorkspace, runCoreMigration } from '../support/run-schematic';
import { guideSteps } from './update-guide-steps';

const plainComponent = `import { Component } from '@angular/core';

@Component({
  selector: 'lab-m39-plain',
  template: '<p>plain</p>',
})
export class LabM39PlainComponent {}
`;

const defaultComponent = `import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'lab-m39-default',
  changeDetection: ChangeDetectionStrategy.Default,
  template: '<p>default</p>',
})
export class LabM39DefaultComponent {}
`;

const userComponent = `import { Component } from '@angular/core';

@Component({
  selector: 'lab-m39-user',
  template: '<p>{{ user?.name }}</p><p>{{ user?.name === null }}</p>',
})
export class LabM39UserComponent {
  user: { name: string } | null = null;
}
`;

const hydrationConfig = `import { ApplicationConfig } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [provideClientHydration()],
};
`;

function angularCompilerOptions(tsconfigText: string | undefined): unknown {
  if (tsconfigText === undefined) throw new Error('the tsconfig is missing from the tree');
  const parsed: unknown = JSON.parse(tsconfigText);
  return typeof parsed === 'object' && parsed !== null ? Object.entries(parsed).find(([key]) => key === 'angularCompilerOptions')?.[1] : undefined;
}

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

  it('Q39.22 change-detection-eager and strict-templates-default write the v21 behavior back into code and the build tsconfig', async () => {
    const workspace: Record<string, string> = {
      ...minimalWorkspace({ '/src/main.ts': plainComponent, '/src/default.ts': defaultComponent }),
      '/tsconfig.app.json': JSON.stringify({
        extends: './tsconfig.json',
        compilerOptions: { outDir: './out' },
        files: ['src/main.ts'],
        include: ['src/**/*.ts'],
      }),
    };
    const afterEager = await runCoreMigration('change-detection-eager', workspace);
    const after = await runCoreMigration('strict-templates-default', afterEager);

    // No changeDetection: the import gains the symbol and the property is inserted before the decorator's last property.
    const plain = after['/src/main.ts'] ?? '';
    expect(plain.split('\n')[0]).toBe("import { Component, ChangeDetectionStrategy } from '@angular/core';");
    expect(plain).toContain("  selector: 'lab-m39-plain',\n  changeDetection: ChangeDetectionStrategy.Eager,\n  template: '<p>plain</p>',");
    // ChangeDetectionStrategy.Default: only the member name changes.
    expect(after['/src/default.ts']).toBe(defaultComponent.replace('ChangeDetectionStrategy.Default', 'ChangeDetectionStrategy.Eager'));
    // strictTemplates false goes into the build target's tsconfig; the file it extends is unchanged.
    expect(angularCompilerOptions(after['/tsconfig.app.json'])).toEqual({ strictTemplates: false });
    expect(after['/tsconfig.json']).toBe(workspace['/tsconfig.json']);
  });

  it('Q39.23 incremental-hydration adds the opt-out and safe-optional-chaining wraps only the null-sensitive user?.name', async () => {
    const workspace = minimalWorkspace({ '/src/main.ts': userComponent, '/src/app.config.ts': hydrationConfig });
    const afterHydration = await runCoreMigration('incremental-hydration', workspace);
    const after = await runCoreMigration('safe-optional-chaining', afterHydration);

    const config = after['/src/app.config.ts'] ?? '';
    expect(config).toContain('providers: [provideClientHydration(withNoIncrementalHydration())],');
    expect(config).toMatch(/import \{[^}]*\bwithNoIncrementalHydration\b[^}]*\} from '@angular\/platform-browser';/);
    // An interpolation coerces to a string, so it is left alone; a strict comparison with null tells null from undefined.
    const user = after['/src/main.ts'] ?? '';
    expect(user).toContain("template: '<p>{{ user?.name }}</p><p>{{ $safeNavigationMigration(user?.name) === null }}</p>',");
  });

  it('Q39.24 our classifier files the five invented steps from 19.0 to 21.0 at the medium level', () => {
    const noOptions = { ngUpgrade: false, material: false, windows: false };
    expect(classifySteps(guideSteps, 1900, 2100, 2, noOptions)).toEqual({
      before: ['A: possible in 18.0, due in 20.0'],
      during: ['B: possible in 20.0, due in 21.0'],
      after: ['C: possible in 21.0, due in 22.0'],
    });
  });
});
