import { Component } from '@angular/core';
import { MigratedSlot, MigratedWidget } from './migrated-widget';

// Migrated sample host: the same parent template as the legacy host, unchanged by the schematics.
@Component({
  selector: 'lab-m19-s6-migrated-host',
  imports: [MigratedWidget, MigratedSlot],
  template: `
    <lab-m19-s6-migrated-widget
      label="Score"
      max="9"
      readonly
      tone="warm"
      [step]="2"
      [(value)]="score"
      (closed)="closedCount = closedCount + 1"
    >
      <span labM19S6Slot>one</span>
      <span labM19S6Slot>two</span>
    </lab-m19-s6-migrated-widget>
    <p id="score">{{ score }}</p>
  `,
})
export class MigratedWidgetHost {
  score = 1;
  closedCount = 0;
}
