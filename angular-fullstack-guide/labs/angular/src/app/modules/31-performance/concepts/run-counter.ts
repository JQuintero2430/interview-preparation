import { Injectable } from '@angular/core';

/**
 * Lab instrumentation for section 3: how many times each kind of per-check work ran.
 * A test reads it; application code would not keep such counts.
 */
@Injectable({ providedIn: 'root' })
export class LabM31RunCounter {
  method = 0;
  computed = 0;
  pipe = 0;
  selectorRows = 0;
  rowComputed = 0;

  /** Sets every count back to zero, so a test counts only what happens next. */
  reset(): void {
    this.method = 0;
    this.computed = 0;
    this.pipe = 0;
    this.selectorRows = 0;
    this.rowComputed = 0;
  }
}
