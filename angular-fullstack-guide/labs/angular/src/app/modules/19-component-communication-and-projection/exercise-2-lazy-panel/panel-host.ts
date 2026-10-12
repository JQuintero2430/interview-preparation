import { Component, OnDestroy, signal } from '@angular/core';
import { Panel } from './panel';
import { PanelBody } from './panel-body';

// Counts constructions and destructions across tests (the spec resets it).
export const bodyCounts = { created: 0, destroyed: 0 };

@Component({ selector: 'lab-m19-heavy', template: `<b>heavy</b>` })
export class Heavy implements OnDestroy {
  constructor() {
    bodyCounts.created++;
  }

  ngOnDestroy(): void {
    bodyCounts.destroyed++;
  }
}

@Component({
  selector: 'lab-m19-panel-host',
  imports: [Panel, PanelBody, Heavy],
  template: `
    <lab-m19-panel [(open)]="open">
      <h3 panelTitle>Details</h3>
      <ng-template labPanelBody><lab-m19-heavy /><i class="owner">{{ owner() }}</i></ng-template>
    </lab-m19-panel>
  `,
})
export class PanelHost {
  readonly open = signal(false);
  readonly owner = signal('host-field');
}

@Component({
  selector: 'lab-m19-untitled-host',
  imports: [Panel],
  template: `<lab-m19-panel />`,
})
export class UntitledHost {}
