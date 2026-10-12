import { Component, signal } from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
import { Account, USERNAME_MESSAGES, usernameRuleSchema, usernameSchema } from './username-schema';

const USERNAME_TEMPLATE = `
  <input id="user" [formField]="usernameForm.user" />
  @if (usernameForm.user().pending()) {
    <p id="status">checking…</p>
  }
  @for (e of usernameForm.user().errors(); track e.kind) {
    <p class="error">{{ message(e.kind) }}</p>
  }
`;

@Component({
  selector: 'lab-m26-username-form',
  imports: [FormField],
  template: USERNAME_TEMPLATE,
})
export class LabM26UsernameForm {
  readonly model = signal<Account>({ user: '' });
  readonly usernameForm = form(this.model, usernameSchema);

  protected message(kind: string): string {
    return USERNAME_MESSAGES[kind] ?? kind;
  }
}

/** The alternative: the same form with the `debounce()` rule. */
@Component({
  selector: 'lab-m26-username-rule-form',
  imports: [FormField],
  template: USERNAME_TEMPLATE,
})
export class LabM26UsernameRuleForm {
  readonly model = signal<Account>({ user: '' });
  readonly usernameForm = form(this.model, usernameRuleSchema);

  protected message(kind: string): string {
    return USERNAME_MESSAGES[kind] ?? kind;
  }
}
