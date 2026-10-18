import { Component, computed, inject, signal } from '@angular/core';
import { LabM31RunCounter } from './run-counter';
import { filterRows, LAB_M31_ROW_COUNT, type LabM31Row, makeRows } from './rows';
import { LabM31TotalPipe } from './total-pipe';

/**
 * The slow-dashboard demo: the same filter as a template method and as a `computed`,
 * a pure pipe over the rows, and an unrelated `clock` signal that also refreshes the view.
 */
@Component({
  selector: 'lab-m31-dashboard',
  imports: [LabM31TotalPipe],
  template: `
    <p>Clock {{ clock() }}</p>
    <p>Method: {{ matchCount() }}</p>
    <p>Computed: {{ matches().length }}</p>
    <p>Total: {{ rows() | labM31Total }}</p>
  `,
})
export class LabM31Dashboard {
  private readonly runs = inject(LabM31RunCounter);
  readonly rows = signal<LabM31Row[]>(makeRows(LAB_M31_ROW_COUNT));
  readonly query = signal('');
  readonly clock = signal(0);

  readonly matches = computed(() => {
    this.runs.computed++;
    return filterRows(this.rows(), this.query());
  });

  protected matchCount(): number {
    this.runs.method++;
    return filterRows(this.rows(), this.query()).length;
  }
}
