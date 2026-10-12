import { TestBed } from '@angular/core/testing';
import { LegacyOrders } from '../legacy/migration-sample/legacy-orders';
import { LegacyRows } from '../legacy/migration-sample/legacy-rows';
import { legacyRowStats } from '../legacy/migration-sample/legacy-row';
import { MigratedOrders } from './migrated/migrated-orders';
import { MigratedRows } from './migrated/migrated-rows';
import { migratedRowStats } from './migrated/migrated-row';

const squash = (text: string) => text.replace(/\s+/g, ' ').trim();

describe('Section 8: migrating with the control flow schematic', () => {
  it('Section 8: the migrated templates render the same text as the legacy ones, up to whitespace', () => {
    const legacy = TestBed.createComponent(LegacyOrders);
    const migrated = TestBed.createComponent(MigratedOrders);
    legacy.detectChanges();
    migrated.detectChanges();
    expect(squash(migrated.nativeElement.textContent)).toBe(
      squash(legacy.nativeElement.textContent),
    );
    expect(squash(legacy.nativeElement.textContent)).toContain('Hello Ann');
    expect(squash(legacy.nativeElement.textContent)).toContain('0: tea new');

    legacy.componentInstance.user.set(null);
    migrated.componentInstance.user.set(null);
    legacy.componentInstance.tags.set(['x']);
    migrated.componentInstance.tags.set(['x']);
    legacy.detectChanges();
    migrated.detectChanges();
    expect(squash(migrated.nativeElement.textContent)).toBe(
      squash(legacy.nativeElement.textContent),
    );
    expect(squash(legacy.nativeElement.textContent)).toContain('Hello guest');
  });

  it('Section 8: a keyed in-place change keeps the row under @for and recreates it under *ngFor with trackBy', () => {
    legacyRowStats.constructed = 0;
    migratedRowStats.constructed = 0;
    const legacy = TestBed.createComponent(LegacyRows);
    const migrated = TestBed.createComponent(MigratedRows);
    legacy.detectChanges();
    migrated.detectChanges();
    expect(legacyRowStats.constructed).toBe(2);
    expect(migratedRowStats.constructed).toBe(2);

    // Same object, same position, a new id: only the property used by the key changes.
    const legacyRows = legacy.componentInstance.rows;
    legacyRows()[0].id = 99;
    legacyRows.update((rows) => [...rows]);
    const migratedRows = migrated.componentInstance.rows;
    migratedRows()[0].id = 99;
    migratedRows.update((rows) => [...rows]);
    legacy.detectChanges();
    migrated.detectChanges();

    expect(legacyRowStats.constructed).toBe(3);
    expect(migratedRowStats.constructed).toBe(2);
    expect(squash(legacy.nativeElement.textContent)).toContain('99:a');
  });
});
