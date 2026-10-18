import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LabM31DestroyRefChartPanel, LabM31LeakyChartPanel, LabM31SignalsChartPanel, labTimerStats } from './chart-panel';

/** The three panels the page can show. */
type PanelVariant = 'leaky' | 'destroyref' | 'signals';

/** Query values the page accepts; anything else shows the leaky panel. */
const VARIANTS: Readonly<Record<string, PanelVariant>> = {
  leaky: 'leaky',
  destroyref: 'destroyref',
  signals: 'signals',
};

/** Name of the lab instrumentation object on `window`; tests count instances and timers through it. */
const HOOK_NAME = '__m31LeakHunt';

/** Leak hunt lab page: `?variant=leaky|destroyref|signals`, with buttons to open and close the panel. */
@Component({
  selector: 'lab-m31-leak-hunt',
  imports: [LabM31LeakyChartPanel, LabM31DestroyRefChartPanel, LabM31SignalsChartPanel],
  template: `
    <h1>Leak hunt lab</h1>
    <p>Variant: {{ variant }}</p>
    <button type="button" [disabled]="isOpen()" (click)="openPanel()">Open panel</button>
    <button type="button" [disabled]="!isOpen()" (click)="closePanel()">Close panel</button>
    @if (isOpen()) {
      @switch (variant) {
        @case ('destroyref') {
          <lab-m31-destroyref-chart-panel />
        }
        @case ('signals') {
          <lab-m31-signals-chart-panel />
        }
        @default {
          <lab-m31-leaky-chart-panel />
        }
      }
    }
  `,
})
export class LabM31LeakHunt {
  protected readonly variant: PanelVariant =
    VARIANTS[inject(ActivatedRoute).snapshot.queryParamMap.get('variant') ?? 'leaky'] ?? 'leaky';
  protected readonly isOpen = signal(false);

  constructor() {
    // Lab instrumentation, not application code: the production build minifies class
    // names, so the prototypes are published for `Runtime.queryObjects`, and the timer
    // counters let tests wait on a value instead of a fixed delay.
    Reflect.set(window, HOOK_NAME, {
      leaky: LabM31LeakyChartPanel.prototype,
      destroyref: LabM31DestroyRefChartPanel.prototype,
      signals: LabM31SignalsChartPanel.prototype,
      timers: labTimerStats,
    });
    inject(DestroyRef).onDestroy(() => Reflect.deleteProperty(window, HOOK_NAME));
  }

  /** Shows the panel; `@if` creates a new instance each time. */
  protected openPanel(): void {
    this.isOpen.set(true);
  }

  /** Hides the panel; `@if` destroys its view. */
  protected closePanel(): void {
    this.isOpen.set(false);
  }
}
