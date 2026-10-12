import { Component, signal } from '@angular/core';
import { FormField, apply, disabled, form, max, min, required } from '@angular/forms/signals';
import type { SchemaFn } from '@angular/forms/signals';
import { LabM26Rating } from './rating';

/** The one schema both hosts share: a rating from 1 to 4. */
export const ratingSchema: SchemaFn<number> = (p) => {
  required(p);
  min(p, 1);
  max(p, 4);
};

@Component({
  selector: 'lab-m26-review-form',
  imports: [FormField, LabM26Rating],
  template: `<lab-m26-rating id="rating" [formField]="reviewForm.rating" />`,
})
export class LabM26ReviewForm {
  readonly model = signal({ rating: 0, locked: false });
  readonly reviewForm = form(this.model, (p) => {
    apply(p.rating, ratingSchema);
    disabled(p.rating, { when: ({ valueOf }) => valueOf(p.locked) });
  });
}
