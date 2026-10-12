import { Component, signal } from '@angular/core';
import { FormField, email, form, min, minLength, required, schema } from '@angular/forms/signals';
import { INITIAL_SIGNUP, SIGNUP_MESSAGES, Signup } from './signup-model';

export const signupSchema = schema<Signup>((p) => {
  required(p.email);
  email(p.email);
  required(p.password);
  minLength(p.password, 8);
  min(p.age, 18);
});

const SIGNUP_TEMPLATE = `
  <input id="email" type="email" [formField]="signupForm.email" />
  @if (signupForm.email().touched()) {
    @for (e of signupForm.email().errors(); track e.kind) {
      <p class="error email-error">{{ message(e.kind) }}</p>
    }
  }
  <input id="password" type="password" [formField]="signupForm.password" />
  @if (signupForm.password().touched()) {
    @for (e of signupForm.password().errors(); track e.kind) {
      <p class="error password-error">{{ message(e.kind) }}</p>
    }
  }
  <input id="age" type="number" [formField]="signupForm.age" />
  @if (signupForm.age().touched()) {
    @for (e of signupForm.age().errors(); track e.kind) {
      <p class="error age-error">{{ message(e.kind) }}</p>
    }
  }
`;

@Component({
  selector: 'lab-m26-signup-form',
  imports: [FormField],
  template: SIGNUP_TEMPLATE,
})
export class LabM26SignupForm {
  readonly model = signal<Signup>({ ...INITIAL_SIGNUP });
  readonly signupForm = form(this.model, (p) => {
    required(p.email);
    email(p.email);
    required(p.password);
    minLength(p.password, 8);
    min(p.age, 18);
  });

  protected message(kind: string): string {
    return SIGNUP_MESSAGES[kind] ?? kind;
  }
}

/** The alternative: the same rules as an exported schema. */
@Component({
  selector: 'lab-m26-signup-schema-form',
  imports: [FormField],
  template: SIGNUP_TEMPLATE,
})
export class LabM26SignupSchemaForm {
  readonly model = signal<Signup>({ ...INITIAL_SIGNUP });
  readonly signupForm = form(this.model, signupSchema);

  protected message(kind: string): string {
    return SIGNUP_MESSAGES[kind] ?? kind;
  }
}
