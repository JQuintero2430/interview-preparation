import { Type, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form } from '@angular/forms/signals';
import type { Schema } from '@angular/forms/signals';
import { LabM26UsernameForm, LabM26UsernameRuleForm } from './username-form';
import { UsernameApi } from './username-api';
import { Account, usernameRuleSchema, usernameSchema } from './username-schema';

async function withFakeTimers(run: () => Promise<void>): Promise<void> {
  vi.useFakeTimers();
  try {
    await TestBed.runInInjectionContext(run);
  } finally {
    vi.useRealTimers();
  }
}

async function settle(ms: number): Promise<void> {
  TestBed.tick();
  await vi.advanceTimersByTimeAsync(ms);
  TestBed.tick();
}

function wait(ms: number): Promise<void> {
  return new Promise((done) => setTimeout(done, ms));
}

async function until(test: () => boolean): Promise<void> {
  for (let i = 0; i < 200 && !test(); i++) {
    await wait(5);
  }
}

interface UsernameHost {
  readonly model: { (): Account };
}

async function mount<T extends UsernameHost>(component: Type<T>): Promise<ComponentFixture<T>> {
  const fixture = TestBed.createComponent(component);
  fixture.autoDetectChanges();
  await fixture.whenStable();
  return fixture;
}

function type(fixture: ComponentFixture<unknown>, value: string): void {
  const el = fixture.nativeElement.querySelector('#user') as HTMLInputElement;
  el.value = value;
  el.dispatchEvent(new Event('input'));
}

function text(fixture: ComponentFixture<unknown>): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}

const variants: [string, Type<UsernameHost>, Schema<Account>][] = [
  ['debounce option', LabM26UsernameForm, usernameSchema],
  ['debounce() rule', LabM26UsernameRuleForm, usernameRuleSchema],
];

describe('E26.3 username check with validateAsync, debounce and a pending state', () => {
  describe.each(variants)('%s', (_name, component, schemaFn) => {
    it('no request runs while the username is shorter than 3 characters', async () => {
      await withFakeTimers(async () => {
        const api = TestBed.inject(UsernameApi);
        const model = signal<Account>({ user: 'ab' });
        const f = form(model, schemaFn);
        await settle(200);
        expect(api.calls).toEqual([]);
        expect(f.user().errors().map((e) => e.kind)).toEqual(['minLength']);
        model.set({ user: 'abc' });
        await settle(200);
        expect(api.calls).toEqual(['abc']);
      });
    });

    it('three quick changes produce one request for the last value', async () => {
      const api = TestBed.inject(UsernameApi);
      const fixture = await mount(component);
      for (const value of ['abc', 'abcd', 'abcde']) {
        type(fixture, value);
        await wait(5);
      }
      await until(() => api.calls.length > 0);
      await wait(100);
      expect(api.calls).toEqual(['abcde']);
      expect(fixture.componentInstance.model().user).toBe('abcde');
    });

    it('the field is pending while the request runs and shows "checking…"', async () => {
      const api = TestBed.inject(UsernameApi);
      api.delayMs = 80;
      const fixture = await mount(component);
      type(fixture, 'bob');
      await until(() => text(fixture).includes('checking…'));
      expect(text(fixture)).toContain('checking…');
      await until(() => !text(fixture).includes('checking…'));
      expect(text(fixture)).not.toContain('checking…');
      expect(api.calls).toEqual(['bob']);
    });

    it('a taken username shows a `taken` error', async () => {
      await withFakeTimers(async () => {
        const api = TestBed.inject(UsernameApi);
        const f = form(signal<Account>({ user: 'ann' }), schemaFn);
        await settle(200);
        expect(api.calls).toEqual(['ann']);
        expect(f.user().errors().map((e) => e.kind)).toEqual(['taken']);
        expect(f.user().pending()).toBe(false);
      });
    });

    it('an API failure shows an `unavailable` error instead of leaving the field pending', async () => {
      await withFakeTimers(async () => {
        const api = TestBed.inject(UsernameApi);
        api.failing = true;
        const f = form(signal<Account>({ user: 'bob' }), schemaFn);
        await settle(200);
        expect(f.user().pending()).toBe(false);
        expect(f.user().errors().map((e) => e.kind)).toEqual(['unavailable']);
      });
    });
  });
});
