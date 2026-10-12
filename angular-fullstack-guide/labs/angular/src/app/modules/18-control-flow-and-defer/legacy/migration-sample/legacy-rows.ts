import { NgFor } from '@angular/common';
import { Component, signal } from '@angular/core';
import { LegacyRow, Row } from './legacy-row';

// Legacy: *ngFor with trackBy over rows that a spec modifies in place.
@Component({
  selector: 'lab-m18-legacy-rows',
  imports: [NgFor, LegacyRow],
  templateUrl: './legacy-rows.html',
})
export class LegacyRows {
  readonly rows = signal<Row[]>([
    { id: 1, name: 'a' },
    { id: 2, name: 'b' },
  ]);

  protected byId(_index: number, row: Row): number {
    return row.id;
  }
}
