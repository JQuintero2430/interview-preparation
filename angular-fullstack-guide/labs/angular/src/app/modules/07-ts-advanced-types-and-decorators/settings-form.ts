import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SETTINGS_DEFAULTS, Settings, SettingsDefaults } from './settings-defaults';

/** One non-nullable control per property of `T`, typed by that property. */
export type ControlsOf<T> = { [K in keyof T]: FormControl<T[K]> };

/**
 * Builds the controls for every settings field.
 * @param defaults The values the controls start from and return to on `reset()`.
 * @returns The controls; the return type makes a field without a control a compile error.
 */
export function settingsControls(defaults: SettingsDefaults): ControlsOf<Settings> {
  return {
    displayName: new FormControl(defaults.displayName, { nonNullable: true }),
    theme: new FormControl(defaults.theme, { nonNullable: true }),
    pageSize: new FormControl(defaults.pageSize, { nonNullable: true }),
    emailAlerts: new FormControl(defaults.emailAlerts, { nonNullable: true }),
  };
}

/** A settings form that starts from the injected defaults. */
@Component({
  selector: 'lab-settings-form',
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form">
      <label>Display name <input formControlName="displayName" /></label>
      <label>
        Theme
        <select formControlName="theme">
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </label>
      <label>Page size <input type="number" formControlName="pageSize" /></label>
      <label><input type="checkbox" formControlName="emailAlerts" /> Email alerts</label>
    </form>
  `,
})
export class SettingsForm {
  readonly form = new FormGroup(settingsControls(inject(SETTINGS_DEFAULTS)));
}
