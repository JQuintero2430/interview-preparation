import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LabM25ProfileForm, LabM25ProfileFormNonNullable } from './profile-form';
import { INITIAL_PROFILE, Profile } from './profile';

type ProfileHost = LabM25ProfileForm | LabM25ProfileFormNonNullable;

// The solution and its FormBuilder.nonNullable alternative must pass every test below.
const VARIANTS: Type<ProfileHost>[] = [LabM25ProfileForm, LabM25ProfileFormNonNullable];

/** A host built in an injection context, never rendered. */
function build(variant: Type<ProfileHost>): ProfileHost {
  return TestBed.runInInjectionContext(() => new variant());
}

function messageOf(action: () => void): string {
  try {
    action();
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
  return '';
}

describe('E25.2 typed profile form', () => {
  it('`getRawValue()` is typed `Profile` and a wrong field name does not compile', () => {
    for (const variant of VARIANTS) {
      const { form } = build(variant);
      const raw: Profile = form.getRawValue();
      // @ts-expect-error TS2551: Property 'emial' does not exist on the raw value (the compiler suggests 'email')
      expect(raw.emial).toBeUndefined();
      // @ts-expect-error TS2551: Property 'emial' does not exist on the group's controls
      expect(form.controls.emial).toBeUndefined();
      // @ts-expect-error TS2322: value is a Partial, so email is string | undefined
      const email: string = form.value.email;
      expect(raw).toEqual(INITIAL_PROFILE);
      expect(email).toBe(INITIAL_PROFILE.email);
    }
  });

  it('`reset()` restores the initial profile, not nulls', () => {
    for (const variant of VARIANTS) {
      const { form } = build(variant);
      form.setValue({ name: 'Bob', email: 'bob@lab-m25.test', start: '2027-01-01', end: '2027-01-02' });
      form.reset();
      expect(form.getRawValue()).toEqual(INITIAL_PROFILE);
      expect(form.valid).toBe(true);
    }
  });

  it('an end date before the start date puts `dateRange` on the group, not on the end control', () => {
    for (const variant of VARIANTS) {
      const { form } = build(variant);
      form.patchValue({ start: '2026-06-01', end: '2026-01-01' });
      expect(form.errors).toEqual({ dateRange: { start: '2026-06-01', end: '2026-01-01' } });
      expect(form.status).toBe('INVALID');
      expect(form.controls.end.errors).toBeNull();
      expect(form.controls.end.hasError('dateRange')).toBe(false);
    }
  });

  it('equal or ordered dates are valid', () => {
    for (const variant of VARIANTS) {
      const { form } = build(variant);
      form.patchValue({ start: '2026-06-01', end: '2026-06-01' });
      expect(form.errors).toBeNull();
      expect(form.valid).toBe(true);
      form.patchValue({ end: '2026-06-02' });
      expect(form.errors).toBeNull();
      expect(form.valid).toBe(true);
    }
  });

  it('loading a profile with an unknown extra key reports the error code and leaves `value` unchanged', () => {
    for (const variant of VARIANTS) {
      const host = build(variant);
      const before = host.form.value;
      const withExtra = { ...INITIAL_PROFILE, name: 'Bob', nickname: 'bobby' };
      expect(messageOf(() => host.load(withExtra))).toContain('NG01001');
      expect(host.form.value).toBe(before);
      expect(host.form.value).toEqual(INITIAL_PROFILE);
      // The children were written before the throw (section 2): only the group's `value` is stale.
      expect(host.form.getRawValue().name).toBe('Bob');
    }
  });

  it('disabling the email control removes it from `value` but keeps it in `getRawValue()`', () => {
    for (const variant of VARIANTS) {
      const { form } = build(variant);
      form.controls.email.disable();
      expect(form.value).toEqual({ name: 'Ann Lee', start: '2026-01-01', end: '2026-12-31' });
      expect(form.getRawValue()).toEqual(INITIAL_PROFILE);
    }
  });
});
