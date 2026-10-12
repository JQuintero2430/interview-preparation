import { Component, inject } from '@angular/core';
import { AsyncValidatorFn, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { LabM25UserApi } from './user-api';
import { LabM25UsernameTakenValidator, usernameTaken } from './username-taken.validator';

export const USERNAME_MIN_LENGTH = 2;
export const USERNAME_DEBOUNCE_MS = 300;

const REGISTER_TEMPLATE = `
  <input name="username" [formControl]="username" />
  @if (username.pending) {
    <p>Checking…</p>
  }
  @if (username.hasError('taken')) {
    <p>That username is taken</p>
  }
`;

function usernameControl(asyncValidator: AsyncValidatorFn): FormControl<string> {
  return new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(USERNAME_MIN_LENGTH)],
    asyncValidators: asyncValidator,
  });
}

@Component({
  selector: 'lab-m25-register-form',
  imports: [ReactiveFormsModule],
  template: REGISTER_TEMPLATE,
})
export class LabM25RegisterForm {
  readonly username = usernameControl(usernameTaken(inject(LabM25UserApi), USERNAME_DEBOUNCE_MS));
}

/** The alternative: the validator class from the injector. */
@Component({
  selector: 'lab-m25-register-form-class',
  imports: [ReactiveFormsModule],
  template: REGISTER_TEMPLATE,
})
export class LabM25RegisterFormClass {
  readonly username = usernameControl(inject(LabM25UsernameTakenValidator).validate);
}
