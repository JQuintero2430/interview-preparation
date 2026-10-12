// LEGACY: older forms APIs, kept for the guide's `#### Legacy` subsections of module 25 and for the specs of the
// task that created them. New code reads and writes the form model. SEC-M25-02, -03, -07 and -10 add exports below
// this block and keep these unchanged.
import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormGroup,
  ValidationErrors,
} from '@angular/forms';
import { Observable, map, merge, startWith } from 'rxjs';

/** Legacy: `ngModel` on a reactive `[formControl]` input, deprecated since v6. Two sources of truth: the control and `text`. Replacement: `LabM25ModelOnFormControlMigrated`. */
@Component({
  selector: 'lab-m25-legacy-model-on-form-control',
  imports: [ReactiveFormsModule, FormsModule],
  template: '<input [formControl]="control" [(ngModel)]="text" />',
})
export class LabM25LegacyModelOnFormControl {
  readonly control = new FormControl('', { nonNullable: true });
  text = 'legacy';
}

/** Replacement for `LabM25LegacyModelOnFormControl`: the control is the only state; read `control.value`, write `control.setValue(...)`. */
@Component({
  selector: 'lab-m25-model-on-form-control-migrated',
  imports: [ReactiveFormsModule],
  template: '<input [formControl]="control" />',
})
export class LabM25ModelOnFormControlMigrated {
  readonly control = new FormControl('legacy', { nonNullable: true });
}

/** Legacy: `initialValueIsDefault: true`, deprecated since v14.0. Replacement: `labM25NonNullableControl`. */
export function labM25LegacyInitialValueIsDefault(): FormControl<string> {
  return new FormControl('start', { initialValueIsDefault: true });
}

/** Replacement for `labM25LegacyInitialValueIsDefault`: the same reset behavior, spelled `nonNullable`. */
export function labM25NonNullableControl(): FormControl<string> {
  return new FormControl('start', { nonNullable: true });
}

/** Legacy: the group left by the v14 typed-forms migration. `UntypedFormGroup` is `FormGroup<any>`, so `value.emial` compiles. Replacement: `labM25TypedProfile`. */
export function labM25LegacyUntypedProfile(): UntypedFormGroup {
  return new UntypedFormGroup({ name: new FormControl('Ann'), email: new FormControl('ann@example.com') });
}

/** Replacement for `labM25LegacyUntypedProfile`: the same two fields, typed and non-nullable, so a misspelled key fails to compile. */
export function labM25TypedProfile(): FormGroup<{ name: FormControl<string>; email: FormControl<string> }> {
  return new FormGroup({
    name: new FormControl('Ann', { nonNullable: true }),
    email: new FormControl('ann@example.com', { nonNullable: true }),
  });
}

/** A group validator for the two samples below: `name` must not be empty. */
export function labM25NameRequired(group: AbstractControl): ValidationErrors | null {
  return group.get('name')?.value ? null : { nameRequired: true };
}

/** Legacy: the `{ validator }` option of `FormBuilder.group`, marked `@deprecated` in the typings (no version given). Replacement: `labM25GroupWithValidators`. */
export function labM25LegacyGroupWithValidator(): FormGroup<{ name: FormControl<string | null> }> {
  return new FormBuilder().group({ name: 'Ann' }, { validator: labM25NameRequired });
}

/** Replacement for `labM25LegacyGroupWithValidator`: the `AbstractControlOptions` spelling, `{ validators }`. */
export function labM25GroupWithValidators(): FormGroup<{ name: FormControl<string | null> }> {
  return new FormBuilder().group({ name: 'Ann' }, { validators: [labM25NameRequired] });
}

/** The label both save indicators below compute: `invalid` first, then `unsaved` when dirty, otherwise `saved`. */
function labM25SaveState(control: AbstractControl): 'saved' | 'unsaved' | 'invalid' {
  if (control.invalid) return 'invalid';
  return control.dirty ? 'unsaved' : 'saved';
}

/** Legacy: a save indicator that merges `valueChanges` and `statusChanges` (with one `startWith`). It never hears `markAsDirty`, `markAsTouched` or `markAsPristine`, which emit on neither stream. Replacement: `labM25EventsSaveIndicator`. */
export function labM25LegacySaveIndicator(control: AbstractControl): Observable<'saved' | 'unsaved' | 'invalid'> {
  return merge(control.valueChanges, control.statusChanges).pipe(
    startWith(null),
    map(() => labM25SaveState(control)),
  );
}

/** Replacement for `labM25LegacySaveIndicator`: the unified `events` stream carries value, status, pristine and touched changes in one subscription. */
export function labM25EventsSaveIndicator(control: AbstractControl): Observable<'saved' | 'unsaved' | 'invalid'> {
  return control.events.pipe(
    startWith(null),
    map(() => labM25SaveState(control)),
  );
}

/** Legacy: the pre-v15 `setDisabledState` behavior, an option of `FormsModule.withConfig` and `ReactiveFormsModule.withConfig`: the accessor hears `setDisabledState` only for a disabled control. Replacement: `labM25CurrentCallSetDisabledState`. */
export const labM25LegacyCallSetDisabledState = {
  callSetDisabledState: 'whenDisabledForLegacyCode',
} satisfies Parameters<typeof ReactiveFormsModule.withConfig>[0];

/** Replacement for `labM25LegacyCallSetDisabledState`: the default since v15, spelled out; the accessor hears `setDisabledState` on every attach. */
export const labM25CurrentCallSetDisabledState = {
  callSetDisabledState: 'always',
} satisfies Parameters<typeof ReactiveFormsModule.withConfig>[0];

/** Legacy: `warnOnNgModelWithFormControl`, marked `@deprecated as of v6` in the typings; it only tunes the warning that `LabM25LegacyModelOnFormControl` earns. Replacement: remove the `ngModel`, as `LabM25ModelOnFormControlMigrated` does. */
export const labM25LegacyNgModelWarning = {
  warnOnNgModelWithFormControl: 'never',
} satisfies Parameters<typeof ReactiveFormsModule.withConfig>[0];
