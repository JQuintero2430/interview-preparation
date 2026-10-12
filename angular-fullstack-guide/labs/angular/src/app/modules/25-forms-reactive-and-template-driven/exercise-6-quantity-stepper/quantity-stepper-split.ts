import { Component, Directive, effect, forwardRef, input, untracked } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';
import { LabM25StepperAccessor, rangeError, STEPPER_TEMPLATE } from './quantity-stepper';

/** The alternative: the stepper is only an accessor; the range rule is a separate directive on the same element. */
@Component({
  selector: 'lab-m25-quantity-stepper-split',
  template: STEPPER_TEMPLATE,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => LabM25QuantityStepperSplit), multi: true }],
})
export class LabM25QuantityStepperSplit extends LabM25StepperAccessor {}

@Directive({
  selector: 'lab-m25-quantity-stepper-split',
  providers: [{ provide: NG_VALIDATORS, useExisting: forwardRef(() => LabM25StepperRange), multi: true }],
})
export class LabM25StepperRange implements Validator {
  readonly min = input(0);
  readonly max = input(10);
  private onValidatorChange: () => void = () => undefined;

  constructor() {
    effect(() => {
      this.min();
      this.max();
      untracked(() => this.onValidatorChange());
    });
  }

  validate(control: AbstractControl): ValidationErrors | null {
    return rangeError(control.value, this.min(), this.max());
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
  }
}
