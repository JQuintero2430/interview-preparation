import { Component, signal } from '@angular/core';

/** Reviews with a "helpful" counter: the only listener on the page that needs this chunk. */
@Component({
  selector: 'lab-m32-ex4-reviews',
  template: `
    <h3>Reviews</h3>
    <p>"Holds its shape after a year." Helpful votes: <output aria-label="Helpful votes">{{ helpful() }}</output></p>
    <button type="button" (click)="helpful.set(helpful() + 1)">Helpful</button>
  `,
})
export class LabM32Ex4Reviews {
  protected readonly helpful = signal(0);
}
