import { InjectionToken } from '@angular/core';

/** The user settings the form edits; the form's controls are derived from this interface. */
export interface Settings {
  displayName: string;
  theme: 'light' | 'dark';
  pageSize: number;
  emailAlerts: boolean;
}

/** Defaults are the same shape, read-only so no consumer can change them for everyone. */
export type SettingsDefaults = Readonly<Settings>;

/** The defaults a new or reset form starts from; override it in a provider (or in TestBed) to change them. */
export const SETTINGS_DEFAULTS = new InjectionToken<SettingsDefaults>('settings defaults', {
  factory: () => ({ displayName: '', theme: 'light', pageSize: 20, emailAlerts: true }),
});
