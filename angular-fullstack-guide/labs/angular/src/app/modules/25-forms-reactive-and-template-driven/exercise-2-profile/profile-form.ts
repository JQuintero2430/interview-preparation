import { Component, inject } from '@angular/core';
import { FormBuilder, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { dateRange } from './date-range.validator';
import { INITIAL_PROFILE, Profile } from './profile';

const PROFILE_TEMPLATE = `
  <form [formGroup]="form">
    <input name="name" formControlName="name" />
    <input name="email" type="email" formControlName="email" />
    <input name="start" type="date" formControlName="start" />
    <input name="end" type="date" formControlName="end" />
  </form>
`;

@Component({
  selector: 'lab-m25-profile-form',
  imports: [ReactiveFormsModule],
  template: PROFILE_TEMPLATE,
})
export class LabM25ProfileForm {
  readonly form = inject(NonNullableFormBuilder).group(
    {
      name: [INITIAL_PROFILE.name, Validators.required],
      email: [INITIAL_PROFILE.email, [Validators.required, Validators.email]],
      start: INITIAL_PROFILE.start,
      end: INITIAL_PROFILE.end,
    },
    { validators: dateRange('start', 'end') },
  );

  load(profile: Profile): void {
    this.form.setValue(profile);
  }
}

/** The alternative: `FormBuilder.nonNullable` instead of injecting `NonNullableFormBuilder`. */
@Component({
  selector: 'lab-m25-profile-form-nonnullable',
  imports: [ReactiveFormsModule],
  template: PROFILE_TEMPLATE,
})
export class LabM25ProfileFormNonNullable {
  readonly form = inject(FormBuilder).nonNullable.group(
    {
      name: [INITIAL_PROFILE.name, Validators.required],
      email: [INITIAL_PROFILE.email, [Validators.required, Validators.email]],
      start: INITIAL_PROFILE.start,
      end: INITIAL_PROFILE.end,
    },
    { validators: dateRange('start', 'end') },
  );

  load(profile: Profile): void {
    this.form.setValue(profile);
  }
}
