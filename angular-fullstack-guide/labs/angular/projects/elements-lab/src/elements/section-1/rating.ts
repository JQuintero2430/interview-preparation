import { Component, input, output } from '@angular/core';

/** `<m37-rating value="3">`: shows a rating; the button emits `rated` with the shown value. */
@Component({
  selector: 'lab-m37-rating',
  template: `
    <span data-testid="rating">Rating: {{ value() }}</span>
    <button type="button" (click)="rated.emit(value())">Rate</button>
  `,
})
export class LabRatingElement {
  readonly value = input('0');
  readonly rated = output<string>();
}
