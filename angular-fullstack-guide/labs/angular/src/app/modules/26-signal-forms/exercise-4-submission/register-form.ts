import { Component, inject, signal } from '@angular/core';
import { FormField, FormRoot, email, form, required } from '@angular/forms/signals';
import type { TreeValidationResult } from '@angular/forms/signals';
import { RegisterApi, Registration } from './register-api';

const MESSAGES: Record<string, string> = {
  required: 'Required',
  email: 'Not an email address',
};

const REGISTER_TEMPLATE = `
    <form id="register" [formRoot]="registerForm">
      <input id="email" [formField]="registerForm.email" />
      <div id="email-errors">
        @if (registerForm.email().touched()) {
          @for (e of registerForm.email().errors(); track e.kind) {
            <p class="error">{{ message(e.kind, e.message) }}</p>
          }
        }
      </div>
      <input id="username" [formField]="registerForm.username" />
      <div id="username-errors">
        @if (registerForm.username().touched()) {
          @for (e of registerForm.username().errors(); track e.kind) {
            <p class="error">{{ message(e.kind, e.message) }}</p>
          }
        }
      </div>
      <button id="go" type="submit" [disabled]="registerForm().submitting()">Register</button>
    </form>
`;

@Component({
  selector: 'lab-m26-register-form',
  imports: [FormField, FormRoot],
  template: REGISTER_TEMPLATE,
})
export class LabM26RegisterForm {
  private readonly api = inject(RegisterApi);
  readonly model = signal<Registration>({ email: '', username: '' });
  readonly registerForm = form(
    this.model,
    (p) => {
      required(p.email);
      email(p.email);
      required(p.username);
    },
    {
      submission: {
        action: async (field): Promise<TreeValidationResult> => {
          const result = await this.api.register(field().value());
          return 'field' in result
            ? { kind: 'server', message: result.message, fieldTree: field[result.field] }
            : undefined;
        },
      },
    },
  );

  protected message(kind: string, text?: string): string {
    return text ?? MESSAGES[kind] ?? kind;
  }
}

/** The alternative: the same form with `ignoreValidators: 'none'` spelled out. */
@Component({
  selector: 'lab-m26-register-strict-form',
  imports: [FormField, FormRoot],
  template: REGISTER_TEMPLATE,
})
export class LabM26RegisterStrictForm {
  private readonly api = inject(RegisterApi);
  readonly model = signal<Registration>({ email: '', username: '' });
  readonly registerForm = form(
    this.model,
    (p) => {
      required(p.email);
      email(p.email);
      required(p.username);
    },
    {
      submission: {
        ignoreValidators: 'none',
        action: async (field): Promise<TreeValidationResult> => {
          const result = await this.api.register(field().value());
          return 'field' in result
            ? { kind: 'server', message: result.message, fieldTree: field[result.field] }
            : undefined;
        },
      },
    },
  );

  protected message(kind: string, text?: string): string {
    return text ?? MESSAGES[kind] ?? kind;
  }
}
