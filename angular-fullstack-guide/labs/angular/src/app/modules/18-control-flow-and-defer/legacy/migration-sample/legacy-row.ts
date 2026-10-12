import { Component, input } from '@angular/core';

export interface Row {
  id: number;
  name: string;
}

// Counts constructor calls, so a spec can tell a kept row from a recreated one.
export const legacyRowStats = { constructed: 0 };

@Component({
  selector: 'lab-m18-legacy-row',
  template: `<span class="row">{{ row().id }}:{{ row().name }}</span>`,
})
export class LegacyRow {
  readonly row = input.required<Row>();

  constructor() {
    legacyRowStats.constructed++;
  }
}
