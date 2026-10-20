// Section 11 claims: the v22 migrations of @angular/core 22.2.1 run on an in-memory workspace, one call per migration,
// through support/run-schematic.ts (no disk, git, npm, ng, network or clock). The input files are ours; the edits are the
// migrations' own, asserted as the runs showed them.
import { minimalWorkspace, runCoreMigration } from '../support/run-schematic';

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

const hydrationConfig = `import { ApplicationConfig } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [provideClientHydration(withEventReplay())],
};
`;

const incrementalConfig = `import { ApplicationConfig } from '@angular/core';
import { provideClientHydration, withIncrementalHydration } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [provideClientHydration(withIncrementalHydration())],
};
`;

function angularCompilerOptions(tsconfigText: string | undefined): unknown {
  if (tsconfigText === undefined) throw new Error('the tsconfig is missing from the tree');
  const parsed: unknown = JSON.parse(tsconfigText);
  return typeof parsed === 'object' && parsed !== null ? Object.entries(parsed).find(([key]) => key === 'angularCompilerOptions')?.[1] : undefined;
}

describe('Module 39 · section 11', () => {
  it('Section 11: change-detection-eager adds Eager to a component with no changeDetection', async () => {
    const after = await runCoreMigration('change-detection-eager', minimalWorkspace({ '/src/main.ts': plainComponent }));

    expect(Object.keys(after)).toEqual(['/angular.json', '/tsconfig.json', '/tsconfig.app.json', '/src/main.ts']);
    const text = after['/src/main.ts'] ?? '';
    // The import gains the symbol, and the new property is inserted before the decorator's last property (the migration inserts at that property's start).
    expect(text.split('\n')[0]).toBe("import { Component, ChangeDetectionStrategy } from '@angular/core';");
    expect(text).toContain(
      "@Component({\n  selector: 'lab-m39-plain',\n  changeDetection: ChangeDetectionStrategy.Eager,\n  template: '<p>plain</p>',\n})\nexport class LabM39PlainComponent {}",
    );
  });

  it('Section 11: change-detection-eager rewrites ChangeDetectionStrategy.Default to Eager', async () => {
    const after = await runCoreMigration('change-detection-eager', minimalWorkspace({ '/src/main.ts': defaultComponent }));

    // Only the member name changes: no import is added and nothing else in the file moves.
    expect(after['/src/main.ts']).toBe(defaultComponent.replace('ChangeDetectionStrategy.Default', 'ChangeDetectionStrategy.Eager'));
  });

  it('Section 11: strict-templates-default writes strictTemplates false only when it is not set', async () => {
    const withOptions = (extra: object): Record<string, string> => ({
      ...minimalWorkspace({ '/src/main.ts': plainComponent }),
      '/tsconfig.app.json': JSON.stringify({ extends: './tsconfig.json', compilerOptions: { outDir: './out' }, ...extra }),
    });

    // Not set anywhere in the chain: written under angularCompilerOptions of the build tsconfig.
    const notSet = await runCoreMigration('strict-templates-default', withOptions({}));
    expect(angularCompilerOptions(notSet['/tsconfig.app.json'])).toEqual({ strictTemplates: false });

    // Set in the file itself: unchanged.
    const own = withOptions({ angularCompilerOptions: { strictTemplates: true } });
    expect((await runCoreMigration('strict-templates-default', own))['/tsconfig.app.json']).toBe(own['/tsconfig.app.json']);

    // Set in the file it extends: unchanged.
    const parent: Record<string, string> = {
      ...withOptions({}),
      '/tsconfig.json': JSON.stringify({ compilerOptions: { strict: true }, angularCompilerOptions: { strictTemplates: true } }),
    };
    expect((await runCoreMigration('strict-templates-default', parent))['/tsconfig.app.json']).toBe(parent['/tsconfig.app.json']);

    // A build tsconfig with no compilerOptions is skipped.
    const empty = minimalWorkspace({ '/src/main.ts': plainComponent });
    expect((await runCoreMigration('strict-templates-default', empty))['/tsconfig.app.json']).toBe(empty['/tsconfig.app.json']);
  });

  it('Section 11: incremental-hydration adds withNoIncrementalHydration to provideClientHydration', async () => {
    const after = await runCoreMigration('incremental-hydration', minimalWorkspace({ '/src/main.ts': hydrationConfig }));
    const text = after['/src/main.ts'] ?? '';

    // The opt-out is appended as the last argument and imported from @angular/platform-browser.
    expect(text).toContain('provideClientHydration(withEventReplay(), withNoIncrementalHydration())');
    expect(text).toMatch(/import \{[^}]*\bwithNoIncrementalHydration\b[^}]*\} from '@angular\/platform-browser';/);

    // A call that already enables incremental hydration is left alone.
    const enabled = await runCoreMigration('incremental-hydration', minimalWorkspace({ '/src/main.ts': incrementalConfig }));
    expect(enabled['/src/main.ts']).toBe(incrementalConfig);
  });
});
