import { inject, Pipe, PipeTransform } from '@angular/core';
import { LabM31RunCounter } from './run-counter';
import type { LabM31Row } from './rows';

/** A pure pipe (the default) that sums the rows' amounts and counts each run of `transform`. */
@Pipe({ name: 'labM31Total' })
export class LabM31TotalPipe implements PipeTransform {
  private readonly runs = inject(LabM31RunCounter);

  /**
   * Sums the amounts of the rows.
   * @param rows the rows to sum; Angular calls this again only when the reference changes
   */
  transform(rows: readonly LabM31Row[]): number {
    this.runs.pipe++;
    return rows.reduce((sum, row) => sum + row.amount, 0);
  }
}
