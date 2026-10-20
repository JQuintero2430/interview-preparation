import { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LabM39LegacyOrderPanel } from '../legacy/legacy-order-panel';
import { LabM39LegacyOrdersModule } from '../legacy/legacy-orders.module';
import { LabM39OrderPanel } from '../migrated/order-panel';

// The same feature before and after the section 10 program. Importing the legacy NgModule here means the lab's
// compile (strictTemplates: true in labs/angular/tsconfig.json) must accept its standalone: false declaration.
const orders = [
  { id: 'A-1', customer: 'Ada' },
  { id: 'B-2', customer: 'Grace' },
];

function hostOf(fixture: ComponentFixture<unknown>): HTMLElement {
  const host: unknown = fixture.nativeElement;
  if (!(host instanceof HTMLElement)) throw new Error('the fixture has no host element');
  return host;
}

/** Renders one panel with the shared orders; `imports` is the NgModule (legacy) or the component itself. */
function render<T>(component: Type<T>, imports: Type<unknown>[]): ComponentFixture<T> {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ imports });
  const fixture = TestBed.createComponent(component);
  fixture.componentRef.setInput('orders', orders);
  fixture.detectChanges();
  return fixture;
}

function rowsOf(fixture: ComponentFixture<unknown>): string[] {
  return Array.from(hostOf(fixture).querySelectorAll('li'), (row) => row.textContent?.trim() ?? '');
}

function clickRow(fixture: ComponentFixture<unknown>, index: number): void {
  hostOf(fixture).querySelectorAll('button').item(index)?.click();
  fixture.detectChanges();
}

describe('Section 10: one feature before and after the migration program', () => {
  it('Section 10: the legacy and the migrated panels render the same rows for the same orders', () => {
    const legacyRows = rowsOf(render(LabM39LegacyOrderPanel, [LabM39LegacyOrdersModule]));
    const migratedRows = rowsOf(render(LabM39OrderPanel, [LabM39OrderPanel]));

    expect(legacyRows).toEqual(['A-1 · Ada', 'B-2 · Grace']);
    expect(migratedRows).toEqual(legacyRows);
  });

  it('Section 10: both panels emit the selected order id when a row is clicked', () => {
    const legacy = render(LabM39LegacyOrderPanel, [LabM39LegacyOrdersModule]);
    const legacyIds: string[] = [];
    legacy.componentInstance.selected.subscribe((id: string) => legacyIds.push(id));
    clickRow(legacy, 1);
    const legacySelected = hostOf(legacy).querySelector('p')?.textContent?.trim();

    const migrated = render(LabM39OrderPanel, [LabM39OrderPanel]);
    const migratedIds: string[] = [];
    migrated.componentInstance.selected.subscribe((id) => migratedIds.push(id));
    clickRow(migrated, 1);
    const migratedSelected = hostOf(migrated).querySelector('p')?.textContent?.trim();

    expect(legacyIds).toEqual(['B-2']);
    expect(migratedIds).toEqual(['B-2']);
    expect(legacySelected).toBe('Selected B-2');
    expect(migratedSelected).toBe(legacySelected);
  });
});
