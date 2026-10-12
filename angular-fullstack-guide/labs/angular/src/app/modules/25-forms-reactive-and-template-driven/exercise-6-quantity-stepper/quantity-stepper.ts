import { Component, effect, forwardRef, input, signal, untracked, WritableSignal } from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
} from '@angular/forms';

/** What the specs need from an order form, whichever forms API it uses. */
export interface LabM25OrderHost {
  readonly max: WritableSignal<number>;
  control(): AbstractControl;
}

export function rangeError(value: number | null, min: number, max: number): ValidationErrors | null {
  const actual = value ?? 0;
  return actual < min || actual > max ? { range: { min, max, actual } } : null;
}

export const STEPPER_TEMPLATE = `
  <button type="button" aria-label="Decrease" [disabled]="disabled()" (click)="step(-1)" (blur)="touch()">-</button>
  <output>{{ value() }}</output>
  <button type="button" aria-label="Increase" [disabled]="disabled()" (click)="step(1)" (blur)="touch()">+</button>
`;

/** The accessor half: the four methods of the contract plus the two buttons' behavior. */
export abstract class LabM25StepperAccessor implements ControlValueAccessor {
  protected readonly value = signal(0);
  protected readonly disabled = signal(false);
  private onChange: (value: number) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: number | null): void {
    this.value.set(value ?? 0);
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected step(delta: number): void {
    this.value.update((current) => current + delta);
    this.onChange(this.value());
  }

  protected touch(): void {
    this.onTouched();
  }
}

@Component({
  selector: 'lab-m25-quantity-stepper',
  template: STEPPER_TEMPLATE,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => LabM25QuantityStepper), multi: true },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => LabM25QuantityStepper), multi: true },
  ],
})
export class LabM25QuantityStepper extends LabM25StepperAccessor implements Validator {
  readonly min = input(0);
  readonly max = input(10);
  private onValidatorChange: () => void = () => undefined;

  constructor() {
    super();
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
