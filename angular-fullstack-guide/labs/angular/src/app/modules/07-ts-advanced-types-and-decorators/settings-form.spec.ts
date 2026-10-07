import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { SETTINGS_DEFAULTS, Settings, SettingsDefaults } from './settings-defaults';
import { ControlsOf, SettingsForm, settingsControls } from './settings-form';

// Fails to compile (TS2322 on `true`) unless A and B are the same type; checked by `tsc -p tsconfig.spec.json`.
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

const DEFAULTS: SettingsDefaults = { displayName: '', theme: 'light', pageSize: 20, emailAlerts: true };

async function setup() {
  const fixture = TestBed.createComponent(SettingsForm);
  await fixture.whenStable();
  const root = fixture.nativeElement as HTMLElement;
  return { form: fixture.componentInstance.form, root };
}

describe('E07.3 SettingsForm with a typed defaults token', () => {
  it('the form starts from the injected defaults', async () => {
    const { form, root } = await setup();
    expect(form.getRawValue()).toEqual(DEFAULTS);
    expect(root.querySelector<HTMLInputElement>('input[type=number]')?.value).toBe('20');
  });

  it('reset() returns to the defaults, not null', async () => {
    const { form } = await setup();
    form.setValue({ displayName: 'Ann', theme: 'dark', pageSize: 50, emailAlerts: false });
    form.reset();
    expect(form.getRawValue()).toEqual(DEFAULTS);
  });

  it('getRawValue() is typed Settings (an @ts-expect-error for a wrong field)', async () => {
    const { form } = await setup();
    const raw = form.getRawValue();
    const typed: Equal<typeof raw, Settings> = true;
    // @ts-expect-error TS2339: Settings has no `colour`.
    const missing: unknown = raw.colour;
    // @ts-expect-error TS2322: `theme` only accepts 'light' or 'dark'.
    const wrongTheme: Settings = { ...raw, theme: 'blue' };
    expect([typed, missing, wrongTheme.theme]).toEqual([true, undefined, 'blue']);
  });

  it('adding a field to Settings without a control is a compile error', () => {
    type ExtendedSettings = Settings & { language: string };
    // @ts-expect-error TS2741: the controls for `Settings` lack a `language` control.
    const controls: ControlsOf<ExtendedSettings> = settingsControls(DEFAULTS);
    const complete: ControlsOf<ExtendedSettings> = { ...settingsControls(DEFAULTS), language: new FormControl('en', { nonNullable: true }) };
    expect([Object.keys(controls), Object.keys(complete).length]).toEqual([Object.keys(DEFAULTS), 5]);
  });

  it('overriding the token in TestBed changes the defaults', async () => {
    const custom: SettingsDefaults = { displayName: 'Guest', theme: 'dark', pageSize: 10, emailAlerts: false };
    TestBed.configureTestingModule({ providers: [{ provide: SETTINGS_DEFAULTS, useValue: custom }] });
    const { form } = await setup();
    form.controls.pageSize.setValue(99);
    form.reset();
    expect(form.getRawValue()).toEqual(custom);
  });
});
