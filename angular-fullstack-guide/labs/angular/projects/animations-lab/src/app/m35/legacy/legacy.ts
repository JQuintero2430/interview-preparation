import { animate, query, stagger, state, style, transition, trigger } from '@angular/animations';
import { Component, signal } from '@angular/core';

// Section 8: the legacy @angular/animations package. Served only by the legacy build, whose main.legacy.ts
// provides the animation engine; the native build never loads this page's package.
@Component({
  selector: 'lab-m35-legacy',
  animations: [
    trigger('panel', [
      state('open', style({ opacity: 1, height: '80px' })),
      state('closed', style({ opacity: 0.3, height: '20px' })),
      transition('open <=> closed', animate('900ms ease')),
    ]),
    trigger('cascade', [
      transition('* => *', [
        query(
          ':enter',
          [style({ opacity: 0 }), stagger(150, animate('900ms', style({ opacity: 1 })))],
          { optional: true },
        ),
      ]),
    ]),
  ],
  template: `
    <h1>Section 8: legacy animations</h1>

    <h2>Trigger with states</h2>
    <button type="button" (click)="toggle()">Toggle panel</button>
    <div class="m35-legacy-panel" data-testid="legacy-panel" [@panel]="panelState()">
      Panel is {{ panelState() }}
    </div>

    <h2>query and stagger</h2>
    <button type="button" (click)="addItems()">Add three items</button>
    <ul class="m35-legacy-list" data-testid="legacy-list" [@cascade]="items().length">
      @for (item of items(); track item) {
        <li class="m35-legacy-item">Item {{ item }}</li>
      }
    </ul>
  `,
  styles: `
    .m35-legacy-panel {
      overflow: hidden;
      background: #dbeafe;
      padding: 0.5rem;
    }
    .m35-legacy-list {
      padding-left: 1.5rem;
    }
  `,
})
export class LabM35Legacy {
  protected readonly panelState = signal<'open' | 'closed'>('open');
  protected readonly items = signal<readonly number[]>([]);

  protected toggle(): void {
    this.panelState.update((current) => (current === 'open' ? 'closed' : 'open'));
  }

  protected addItems(): void {
    this.items.update((current) => [
      ...current,
      current.length + 1,
      current.length + 2,
      current.length + 3,
    ]);
  }
}
