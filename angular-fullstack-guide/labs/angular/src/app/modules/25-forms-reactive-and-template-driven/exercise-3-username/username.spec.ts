import { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { LabM25RegisterForm, LabM25RegisterFormClass, USERNAME_DEBOUNCE_MS } from './register-form';
import { LabM25UserApi } from './user-api';
import { usernameTaken } from './username-taken.validator';

/** Fake time that lets the scheduled zoneless repaint run (`fixture.whenStable()` never settles under fake timers). */
const REPAINT_MS = 50;

interface RegisterHost {
  readonly username: FormControl<string>;
}

// The solution and its validator-class alternative must pass every test below.
const VARIANTS: Type<RegisterHost>[] = [LabM25RegisterForm, LabM25RegisterFormClass];

interface Rig {
  readonly fixture: ComponentFixture<RegisterHost>;
  readonly api: LabM25UserApi;
  readonly control: FormControl<string>;
  /** The rendered text after the repaint a status flip schedules. */
  text(): Promise<string>;
  type(value: string): void;
}

/** A fresh injector per variant, rendered once with real timers; fake timers start after this. */
async function mount(variant: Type<RegisterHost>): Promise<Rig> {
  TestBed.resetTestingModule();
  const fixture = TestBed.createComponent(variant);
  fixture.autoDetectChanges();
  await fixture.whenStable();
  const root: HTMLElement = fixture.nativeElement;
  return {
    fixture,
    api: TestBed.inject(LabM25UserApi),
    control: fixture.componentInstance.username,
    text: async () => {
      await vi.advanceTimersByTimeAsync(REPAINT_MS);
      return root.textContent ?? '';
    },
    type: (value) => {
      const input = root.querySelector('input')!;
      input.value = value;
      input.dispatchEvent(new Event('input'));
    },
  };
}

/** Runs a body under fake timers over every variant and always restores the real ones. */
function eachVariant(body: (rig: Rig) => Promise<void>): () => Promise<void> {
  return async () => {
    for (const variant of VARIANTS) {
      const rig = await mount(variant);
      vi.useFakeTimers();
      try {
        await body(rig);
      } finally {
        vi.useRealTimers();
      }
    }
  };
}

const settle = (ms: number) => vi.advanceTimersByTimeAsync(ms);

describe('E25.3 username availability', () => {
  it('typing three characters quickly calls the API once, with the last value', eachVariant(async ({ api, type }) => {
    type('a');
    await settle(50);
    type('ab');
    await settle(50);
    type('abc');
    await settle(USERNAME_DEBOUNCE_MS - 1);
    expect(api.calls).toEqual([]);
    await settle(1);
    expect(api.calls).toEqual(['abc']);
    expect(api.cancelled).toEqual([]);
  }));

  it('an empty or too-short username never calls the API', eachVariant(async ({ api, control, type }) => {
    type('');
    type('a');
    await settle(USERNAME_DEBOUNCE_MS * 3);
    expect(api.calls).toEqual([]);
    expect(control.errors).toHaveProperty('minlength');
    expect(control.pending).toBe(false);
  }));

  it('the control is PENDING during the check and the form shows "Checking…"', eachVariant(async ({ api, control, text, type }) => {
    type('bob');
    await settle(0);
    expect(control.status).toBe('PENDING');
    expect(await text()).toContain('Checking…');
    await settle(USERNAME_DEBOUNCE_MS);
    expect(api.calls).toEqual(['bob']);
    expect(control.status).toBe('PENDING');
    await settle(api.delayMs);
    expect(control.status).toBe('VALID');
    expect(await text()).not.toContain('Checking…');
  }));

  it('a taken name sets the taken error and a free name clears it', eachVariant(async ({ api, control, text, type }) => {
    type('ann');
    await settle(USERNAME_DEBOUNCE_MS + api.delayMs);
    expect(control.errors).toEqual({ taken: true });
    expect(await text()).toContain('That username is taken');
    type('bob');
    await settle(USERNAME_DEBOUNCE_MS + api.delayMs);
    expect(control.errors).toBeNull();
    expect(await text()).not.toContain('That username is taken');
  }));

  it('a new value while a check is running cancels the old request', eachVariant(async ({ api, control, type }) => {
    type('abc');
    await settle(USERNAME_DEBOUNCE_MS + api.delayMs / 2);
    expect(api.calls).toEqual(['abc']);
    type('abcd');
    expect(api.cancelled).toEqual(['abc']);
    await settle(USERNAME_DEBOUNCE_MS + api.delayMs);
    expect(api.calls).toEqual(['abc', 'abcd']);
    expect(api.cancelled).toEqual(['abc']);
    expect(control.status).toBe('VALID');
  }));

  it('the control never stays PENDING after the API answers', eachVariant(async ({ api, control, type }) => {
    for (const name of ['ann', 'bob']) {
      type(name);
      await settle(USERNAME_DEBOUNCE_MS + api.delayMs);
      expect(control.pending).toBe(false);
    }
    let completed = false;
    const answer = usernameTaken(api, USERNAME_DEBOUNCE_MS)(new FormControl('cy'));
    if (!('subscribe' in answer)) throw new Error('the validator must return an Observable');
    answer.subscribe({ complete: () => (completed = true) });
    await settle(USERNAME_DEBOUNCE_MS + api.delayMs);
    expect(completed).toBe(true);
  }));
});
