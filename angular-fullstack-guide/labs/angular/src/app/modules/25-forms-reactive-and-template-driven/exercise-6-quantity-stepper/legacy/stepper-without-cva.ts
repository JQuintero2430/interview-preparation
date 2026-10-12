// LEGACY: a stepper built on `model()` alone, kept to show the difference. It implements no `ControlValueAccessor`
// and no `Validator`, so it has no touched callback, no disabled state and no range rule. A `model()` named `count`
// is the shape that threw NG01203 under `formControlName` in module 25 section 10; no test binds this one to a form.
// Replacement: `LabM25QuantityStepper` in `../quantity-stepper.ts`.
import { Component, model } from '@angular/core';

@Component({
  selector: 'lab-m25-stepper-without-cva',
  template: `
    <button type="button" aria-label="Decrease" (click)="count.set(count() - 1)">-</button>
    <output>{{ count() }}</output>
    <button type="button" aria-label="Increase" (click)="count.set(count() + 1)">+</button>
  `,
})
export class LabM25StepperWithoutCva {
  readonly count = model(0);
}
