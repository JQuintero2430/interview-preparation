import { Component, ElementRef, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LabM25FieldErrors } from './field-errors';
import { shouldShowErrors } from './show-errors';

export const PASSWORD_MIN_LENGTH = 8;

const CHECKOUT_TEMPLATE = `
  <form [formGroup]="form" #f="ngForm" (ngSubmit)="submit()">
    <label for="name">Name</label>
    <input
      id="name"
      formControlName="name"
      [attr.aria-invalid]="shown(form.controls.name, f.submitted) ? 'true' : null"
      [attr.aria-describedby]="shown(form.controls.name, f.submitted) ? 'name-errors' : null"
    />
    <lab-m25-field-errors [control]="form.controls.name" [submitted]="f.submitted" errorId="name-errors" />
    <label for="password">Password</label>
    <input
      id="password"
      type="password"
      formControlName="password"
      [attr.aria-invalid]="shown(form.controls.password, f.submitted) ? 'true' : null"
      [attr.aria-describedby]="shown(form.controls.password, f.submitted) ? 'password-errors' : null"
    />
    <lab-m25-field-errors [control]="form.controls.password" [submitted]="f.submitted" errorId="password-errors" />
    <button type="submit">Pay</button>
  </form>
`;

abstract class LabM25CheckoutBase {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: Validators.required }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(PASSWORD_MIN_LENGTH)],
    }),
  });
  protected readonly shown = shouldShowErrors;
  /** The alternative marks every control touched on submit instead of reading `submitted`. */
  protected readonly touchOnSubmit: boolean = false;

  protected submit(): void {
    if (this.touchOnSubmit) this.form.markAllAsTouched();
    this.host.nativeElement.querySelector<HTMLElement>('input.ng-invalid')?.focus();
  }
}

@Component({
  selector: 'lab-m25-checkout-form',
  imports: [ReactiveFormsModule, LabM25FieldErrors],
  template: CHECKOUT_TEMPLATE,
})
export class LabM25CheckoutForm extends LabM25CheckoutBase {}

@Component({
  selector: 'lab-m25-checkout-form-touched',
  imports: [ReactiveFormsModule, LabM25FieldErrors],
  template: CHECKOUT_TEMPLATE,
})
export class LabM25CheckoutFormTouched extends LabM25CheckoutBase {
  protected override readonly touchOnSubmit = true;
}
