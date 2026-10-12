import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LabM25SignupApi } from './signup-model';

const SIGNUP_REACTIVE_TEMPLATE = `
  <form [formGroup]="form" (ngSubmit)="submit()">
    <input name="email" type="email" formControlName="email" />
    <input name="password" type="password" formControlName="password" />
    <input name="newsletter" type="checkbox" formControlName="newsletter" />
    <button type="submit">Sign up</button>
  </form>
`;

@Component({
  selector: 'lab-m25-signup-reactive',
  imports: [ReactiveFormsModule],
  template: SIGNUP_REACTIVE_TEMPLATE,
})
export class LabM25SignupReactive {
  private readonly api = inject(LabM25SignupApi);
  readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] }),
    newsletter: new FormControl(false, { nonNullable: true }),
  });

  submit(): void {
    if (this.form.invalid) return;
    this.api.submit(this.form.getRawValue());
  }
}

/** The alternative: the same form built with `NonNullableFormBuilder`. */
@Component({
  selector: 'lab-m25-signup-reactive-builder',
  imports: [ReactiveFormsModule],
  template: SIGNUP_REACTIVE_TEMPLATE,
})
export class LabM25SignupReactiveBuilder {
  private readonly api = inject(LabM25SignupApi);
  readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    newsletter: false,
  });

  submit(): void {
    if (this.form.invalid) return;
    this.api.submit(this.form.getRawValue());
  }
}
