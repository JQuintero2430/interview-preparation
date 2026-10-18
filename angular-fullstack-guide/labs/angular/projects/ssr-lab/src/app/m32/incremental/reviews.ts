import { Component, signal } from '@angular/core';

/** Reviews with a "helpful" counter: the only code in this block, loaded when the block hydrates. */
@Component({
  selector: 'lab-m32-incremental-reviews',
  template: `
    <h3>Reviews</h3>
    <p>"Sturdy and quiet." Helpful votes: <output aria-label="Helpful votes">{{ helpful() }}</output></p>
    <button type="button" (click)="helpful.set(helpful() + 1)">Helpful</button>
  `,
})
export class LabM32IncrementalReviews {
  protected readonly helpful = signal(0);
}
