import { Component, signal } from '@angular/core';
import { Tab } from './tab';
import { Tabs } from './tabs';

// Counts constructions so the spec can show that projection is not instantiation.
export const probeCount = { created: 0 };

@Component({ selector: 'lab-m19-probe', template: `probe` })
export class Probe {
  constructor() {
    probeCount.created++;
  }
}

@Component({
  selector: 'lab-m19-tabs-host',
  imports: [Tabs, Tab, Probe],
  template: `
    <lab-m19-tabs [(selected)]="selected">
      <lab-m19-tab label="Overview"><lab-m19-probe /></lab-m19-tab>
      <lab-m19-tab label="Details"><lab-m19-probe /></lab-m19-tab>
      <lab-m19-tab label="Archived" disabled><lab-m19-probe /></lab-m19-tab>
      @if (showExtra()) {
        <lab-m19-tab label="Extra">extra</lab-m19-tab>
      }
    </lab-m19-tabs>
  `,
})
export class TabsHost {
  readonly selected = signal(0);
  readonly showExtra = signal(false);
}
