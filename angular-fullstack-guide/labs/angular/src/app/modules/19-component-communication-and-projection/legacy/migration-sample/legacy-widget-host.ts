import { Component } from '@angular/core';
import { LegacySlot, LegacyWidget } from './legacy-widget';

// Legacy sample host: the parent template that the schematics must leave untouched.
@Component({
  selector: 'lab-m19-s6-legacy-host',
  imports: [LegacyWidget, LegacySlot],
  template: `
    <lab-m19-s6-legacy-widget
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
    </lab-m19-s6-legacy-widget>
    <p id="score">{{ score }}</p>
  `,
})
export class LegacyWidgetHost {
  score = 1;
  closedCount = 0;
}
