import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, signal } from '@angular/core';

// Section 9: the panel before the migration. The route loads it only in the legacy build, where an animation
// module type is provided; its markup equals the migrated panel's in migration.ts.
@Component({
  selector: 'lab-m35-migration-legacy',
  animations: [
    trigger('panel', [
      state('open', style({ opacity: 1, height: '80px' })),
      state('closed', style({ opacity: 0.3, height: '20px' })),
      transition('open <=> closed', animate('900ms ease')),
    ]),
  ],
  template: `
    <h1>Section 9: migration</h1>
    <button type="button" (click)="toggle()">Toggle panel</button>
    <div class="m35-mig-panel" data-testid="mig-panel" [@panel]="panelState()">
      Panel is {{ panelState() }}
    </div>
  `,
  styles: `
    .m35-mig-panel {
      overflow: hidden;
      background: #dbeafe;
      padding: 0.5rem;
    }
  `,
})
export class LabM35MigrationLegacy {
  protected readonly panelState = signal<'open' | 'closed'>('open');

  protected toggle(): void {
    this.panelState.update((current) => (current === 'open' ? 'closed' : 'open'));
  }
}
