import { Component, signal } from '@angular/core';
import { MigratedRow, Row } from './migrated-row';

// Migrated: the output of the schematic on legacy/migration-sample/legacy-rows.ts, renamed.
@Component({
  selector: 'lab-m18-migrated-rows',
  imports: [MigratedRow],
  templateUrl: './migrated-rows.html',
})
export class MigratedRows {
  readonly rows = signal<Row[]>([
    { id: 1, name: 'a' },
    { id: 2, name: 'b' },
  ]);

  protected byId(_index: number, row: Row): number {
    return row.id;
  }
}
