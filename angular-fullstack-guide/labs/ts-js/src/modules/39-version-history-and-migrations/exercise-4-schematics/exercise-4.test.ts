// Exercise 39.4: five criteria, each run over both variants. The schematics are @angular/core 22.2.1's own, run through
// support/run-schematic.ts on an in-memory tree holding the text of labs/angular's legacy feature (read-only); the edits
// asserted are the ones the runs showed. control-flow and inject are not run: they read their tsconfig from the disk
// relative to process.cwd() (read, not run), so in memory their result would depend on where the test starts.
// No disk write, clock, network, git, npm or ng.
import type { Workspace } from '../support/run-schematic';
import { modernize as oneByOne } from './a/modernize';
import { modernize as combined } from './b/modernize';
import { scanLeftovers } from './leftovers';
import { legacyWorkspace, panelPath, type Modernize } from './workspace';

function panel(tree: Workspace): string {
  const text = tree[panelPath];
  if (text === undefined) throw new Error(`${panelPath} is missing from the tree`);
  return text;
}

function changedPaths(before: Workspace, after: Workspace): string[] {
  return Object.keys(after).filter((path) => before[path] !== after[path]);
}

describe.each<[string, Modernize]>([
  ['a (one schematic per step)', oneByOne],
  ['b (the combined signals schematic)', combined],
])('Exercise 39.4 · modernize %s', (_variant, modernize) => {
  it('replaces decorator outputs with output()', async () => {
    const before = legacyWorkspace();
    const after = await modernize(before);

    // Only the panel changes, and only in two places: the import line and the output declaration.
    expect(changedPaths(before, after)).toEqual([panelPath]);
    expect(panel(after)).toBe(
      panel(before)
        .replace(
          "import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';",
          "import { ChangeDetectionStrategy, Component, Input, output } from '@angular/core';",
        )
        .replace('  @Output() selected = new EventEmitter<string>();', '  readonly selected = output<string>();'),
    );
  });

  it('keeps a decorator input that *ngIf narrows, with the reason as a TODO', async () => {
    const after = await modernize(legacyWorkspace(), { insertTodos: true });

    expect(panel(after)).toContain(
      [
        '  // TODO: Skipped for migration because:',
        '  //  This input is used in a control flow expression (e.g. `@if` or `*ngIf`)',
        '  //  and migrating would break narrowing currently.',
        '  @Input({ required: true }) orders!: LabM39LegacyOrder[];',
      ].join('\n'),
    );
  });

  it('replaces decorator inputs with signal inputs in best-effort mode', async () => {
    const text = panel(await modernize(legacyWorkspace(), { bestEffortMode: true }));

    // The field becomes a required signal input and every template read becomes a call.
    expect(text).toContain('  readonly orders = input.required<LabM39LegacyOrder[]>();');
    expect(text).toContain('<ul *ngIf="orders().length; else empty">');
    expect(text).toContain('<li *ngFor="let order of orders()">');
    expect(text).not.toContain('@Input(');
  });

  it('leaves the structural directives, constructor injection and NgModule to the scanner', async () => {
    // The untouched feature is the control: the scanner finds all four kinds there.
    expect(scanLeftovers(legacyWorkspace())).toEqual([
      'NgModule: legacy-orders.module.ts',
      'constructor injection: legacy-order-panel.ts',
      'decorator input: legacy-order-panel.ts',
      'structural directive: legacy-order-panel.ts',
    ]);
    expect(scanLeftovers(await modernize(legacyWorkspace(), { bestEffortMode: true }))).toEqual([
      'NgModule: legacy-orders.module.ts',
      'constructor injection: legacy-order-panel.ts',
      'structural directive: legacy-order-panel.ts',
    ]);
  });

  it('changes nothing when the same steps run a second time', async () => {
    const first = await modernize(legacyWorkspace());
    const second = await modernize(first);

    expect(second).toEqual(first);
  });
});
