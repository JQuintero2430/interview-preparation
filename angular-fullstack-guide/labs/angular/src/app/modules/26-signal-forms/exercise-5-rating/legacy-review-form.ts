import { Component } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormField } from '@angular/forms/signals';
import { SignalFormControl } from '@angular/forms/signals/compat';
import { LabM26Rating } from './rating';
import { ratingSchema } from './review-form';

/** Legacy host: a reactive FormGroup whose rating is a SignalFormControl. */
@Component({
  selector: 'lab-m26-legacy-review-form',
  imports: [ReactiveFormsModule, FormField, LabM26Rating],
  template: `
    <form [formGroup]="group">
      <lab-m26-rating id="rating" [formField]="rating.fieldTree" />
    </form>
  `,
})
export class LabM26LegacyReviewForm {
  readonly rating = new SignalFormControl<number>(0, ratingSchema);
  readonly group = new FormGroup({ rating: this.rating });
}

/** The alternative: the same group, with the control bound by name through the reactive directives. */
@Component({
  selector: 'lab-m26-legacy-named-review-form',
  imports: [ReactiveFormsModule, LabM26Rating],
  template: `
    <form [formGroup]="group">
      <lab-m26-rating id="rating" formControlName="rating" />
    </form>
  `,
})
export class LabM26LegacyNamedReviewForm {
  readonly rating = new SignalFormControl<number>(0, ratingSchema);
  readonly group = new FormGroup({ rating: this.rating });
}
