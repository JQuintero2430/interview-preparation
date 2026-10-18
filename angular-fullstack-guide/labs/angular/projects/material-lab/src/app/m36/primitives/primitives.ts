import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { map } from 'rxjs';
import { Clipboard } from '@angular/cdk/clipboard';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { type StepperSelectionEvent } from '@angular/cdk/stepper';
import { MatButton } from '@angular/material/button';
import { MatStep, MatStepper, MatStepperIcon, MatStepperNext } from '@angular/material/stepper';

const SHARE_LINK = 'example.com/share/42';

/**
 * The three small CDK primitives on one page: a linear stepper (Material's look on the CDK's logic), a
 * `BreakpointObserver` on the `Handset` query, and a `Clipboard.copy` button. The text of each `output` is what the tests read.
 */
@Component({
  selector: 'lab-m36-primitives',
  imports: [ReactiveFormsModule, MatButton, MatStepper, MatStep, MatStepperIcon, MatStepperNext],
  host: { class: 'm36-primitives' },
  template: `
    <h1>Section 8: the smaller primitives</h1>

    <section>
      <h2>Linear stepper</h2>
      <mat-stepper linear aria-label="Checkout" (selectionChange)="onStepChange($event)">
        <ng-template matStepperIcon="edit">✓</ng-template>
        <ng-template matStepperIcon="done">✓</ng-template>
        <mat-step [stepControl]="email" label="Email" aria-label="Email step">
          <input class="m36-step-input" type="email" aria-label="Email address" [formControl]="email" />
          <button matButton="filled" matStepperNext type="button">To note</button>
        </mat-step>
        <mat-step label="Note" aria-label="Note step">
          <p>This step has no control, so it never blocks.</p>
          <button matButton="filled" matStepperNext type="button">To finish</button>
        </mat-step>
        <mat-step label="Finish" aria-label="Finish step">
          <p>Finished.</p>
        </mat-step>
      </mat-stepper>
      <output aria-label="Step report">{{ stepReport() }}</output>
    </section>

    <section>
      <h2>BreakpointObserver</h2>
      @if (handset(); as current) {
        <output aria-label="Handset state">Handset: {{ current.state.matches }}</output>
        <output aria-label="Handset emissions">Emissions: {{ current.count }}</output>
      }
      <ul aria-label="Handset queries">
        @for (line of queryLines(); track line) {
          <li>{{ line }}</li>
        }
      </ul>
    </section>

    <section>
      <h2>Clipboard</h2>
      <button matButton="outlined" type="button" (click)="copy()">Copy link</button>
      <output aria-label="Copy result">{{ copyResult() }}</output>
    </section>
  `,
})
export class LabM36Primitives {
  private readonly breakpoints = inject(BreakpointObserver);
  private readonly clipboard = inject(Clipboard);

  protected readonly email = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] });
  protected readonly stepReport = signal('No move yet');

  /** Each emission of the observer with its position in the stream (`map` passes the index). */
  protected readonly handset = toSignal(
    this.breakpoints.observe(Breakpoints.Handset).pipe(map((state, index) => ({ state, count: index + 1 }))),
    { initialValue: null },
  );
  protected readonly queryLines = computed(() =>
    Object.entries(this.handset()?.state.breakpoints ?? {}).map(([query, matches]) => `${query}: ${matches}`),
  );

  protected readonly copyResult = signal('Not copied yet');

  protected onStepChange(event: StepperSelectionEvent): void {
    this.stepReport.set(`Moved: selectedIndex ${event.selectedIndex}, previouslySelectedIndex ${event.previouslySelectedIndex}`);
  }

  /** The click is the user gesture `execCommand('copy')` needs; the boolean is what `Clipboard.copy` returns. */
  protected copy(): void {
    this.copyResult.set(`Copied: ${this.clipboard.copy(SHARE_LINK)}`);
  }
}
