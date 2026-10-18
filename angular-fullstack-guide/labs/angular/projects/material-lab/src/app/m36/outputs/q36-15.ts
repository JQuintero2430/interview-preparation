import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs';

/** `Breakpoints.Handset` observed once: the state it reports and how many times it has emitted. */
@Component({
  selector: 'lab-m36-q15',
  host: { class: 'm36-out-page' },
  template: `
    <h1>Q36.15: Handset at two widths</h1>
    @if (handset(); as current) {
      <output aria-label="Handset matches">Handset: {{ current.matches }}</output>
      <output aria-label="Handset emissions">Emissions: {{ current.count }}</output>
    }
  `,
})
export class LabM36Q15 {
  /** `map` passes each emission's index, so the count is the number of times the observer emitted. */
  protected readonly handset = toSignal(
    inject(BreakpointObserver)
      .observe(Breakpoints.Handset)
      .pipe(map((state, index) => ({ matches: state.matches, count: index + 1 }))),
    { initialValue: null },
  );
}
