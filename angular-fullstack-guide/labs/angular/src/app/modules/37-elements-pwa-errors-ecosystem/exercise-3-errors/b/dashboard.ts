import { Component, ErrorHandler, OnInit, ViewContainerRef, inject, input, signal, untracked, type Type } from '@angular/core';
import { LabM37Ex3Chart, LabM37Ex3List, LabM37Ex3Profile } from '../widgets';

/**
 * A slot creates its widget with `ViewContainerRef.createComponent(…, { onError })`. The widget is inserted
 * after the slot's host element; the fallback and the Retry button live in the slot's own template.
 */
@Component({
  selector: 'lab-m37-ex3-b-slot',
  template: `
    @if (failed()) {
      <p role="alert">{{ label() }} is unavailable.</p>
      <button type="button" (click)="retry()">Retry</button>
    }
  `,
})
export class LabM37Ex3BSlot implements OnInit {
  readonly widget = input.required<Type<unknown>>();
  readonly label = input.required<string>();
  protected readonly failed = signal(false);
  private readonly container = inject(ViewContainerRef);
  private readonly handler = inject(ErrorHandler);

  ngOnInit(): void {
    this.create();
  }

  protected retry(): void {
    this.failed.set(false);
    this.create();
  }

  private create(): void {
    this.container.createComponent(this.widget(), {
      // Called for errors during the widget's change detection; a constructor error is thrown by createComponent.
      onError: (error, details) => {
        this.container.clear();
        untracked(() => this.failed.set(true));
        if (this.handler.onViewError) {
          this.handler.onViewError(error, details);
        } else {
          this.handler.handleError(error);
        }
      },
    });
  }
}

/** Variant b: three slots filled programmatically. */
@Component({
  selector: 'lab-m37-ex3-b-dashboard',
  imports: [LabM37Ex3BSlot],
  template: `
    <section class="m37-widget" data-widget="chart">
      <h2>Chart</h2>
      <lab-m37-ex3-b-slot [widget]="chart" label="Chart" />
    </section>
    <section class="m37-widget" data-widget="list">
      <h2>List</h2>
      <lab-m37-ex3-b-slot [widget]="list" label="List" />
    </section>
    <section class="m37-widget" data-widget="profile">
      <h2>Profile</h2>
      <lab-m37-ex3-b-slot [widget]="profile" label="Profile" />
    </section>
  `,
})
export class LabM37Ex3BDashboard {
  protected readonly chart = LabM37Ex3Chart;
  protected readonly list = LabM37Ex3List;
  protected readonly profile = LabM37Ex3Profile;
}
