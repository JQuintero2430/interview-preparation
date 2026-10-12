import { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LabM26RegisterForm, LabM26RegisterStrictForm } from './register-form';
import { RegisterApi } from './register-api';

function wait(ms: number): Promise<void> {
  return new Promise((done) => setTimeout(done, ms));
}

async function until(test: () => boolean): Promise<void> {
  for (let i = 0; i < 200 && !test(); i++) {
    await wait(5);
  }
}

interface RegisterHost {
  readonly registerForm: { (): { submitting(): boolean } };
}

async function mount(component: Type<RegisterHost>): Promise<ComponentFixture<RegisterHost>> {
  const fixture = TestBed.createComponent(component);
  fixture.autoDetectChanges();
  await fixture.whenStable();
  return fixture;
}

function type(fixture: ComponentFixture<unknown>, id: string, value: string): void {
  const el = fixture.nativeElement.querySelector(`#${id}`) as HTMLInputElement;
  el.value = value;
  el.dispatchEvent(new Event('input'));
}

function submitEvent(fixture: ComponentFixture<unknown>): void {
  const form = fixture.nativeElement.querySelector('#register') as HTMLFormElement;
  form.dispatchEvent(new Event('submit', { cancelable: true }));
}

function errors(fixture: ComponentFixture<unknown>, id: string): string[] {
  const root = fixture.nativeElement.querySelector(`#${id}-errors`) as HTMLElement;
  return Array.from(root.querySelectorAll('.error'), (p) => p.textContent?.trim() ?? '');
}

function button(fixture: ComponentFixture<unknown>): HTMLButtonElement {
  return fixture.nativeElement.querySelector('#go') as HTMLButtonElement;
}

async function fillAndSubmit(fixture: ComponentFixture<RegisterHost>): Promise<void> {
  type(fixture, 'email', 'a@b.co');
  type(fixture, 'username', 'ann');
  submitEvent(fixture);
  TestBed.tick();
}

async function finish(fixture: ComponentFixture<RegisterHost>): Promise<void> {
  await until(() => !fixture.componentInstance.registerForm().submitting());
  await fixture.whenStable();
}

const variants: [string, Type<RegisterHost>][] = [
  ['default ignoreValidators', LabM26RegisterForm],
  ["ignoreValidators 'none'", LabM26RegisterStrictForm],
];

describe('E26.4 submit with server errors, FormRoot, submit() and field-targeted errors', () => {
  describe.each(variants)('%s', (_name, component) => {
    it('submitting an invalid form calls no API and shows every error', async () => {
      const api = TestBed.inject(RegisterApi);
      const fixture = await mount(component);
      expect(errors(fixture, 'email')).toEqual([]);
      submitEvent(fixture);
      await fixture.whenStable();
      expect(api.calls).toEqual([]);
      expect(errors(fixture, 'email')).toEqual(['Required']);
      expect(errors(fixture, 'username')).toEqual(['Required']);
    });

    it('submitting a valid form calls the API once with the model value', async () => {
      const api = TestBed.inject(RegisterApi);
      const fixture = await mount(component);
      await fillAndSubmit(fixture);
      await finish(fixture);
      expect(api.calls).toEqual([{ email: 'a@b.co', username: 'ann' }]);
      expect(errors(fixture, 'email')).toEqual([]);
      expect(errors(fixture, 'username')).toEqual([]);
    });

    it('the submit button is disabled while the submission runs', async () => {
      const api = TestBed.inject(RegisterApi);
      const release = api.hold();
      const fixture = await mount(component);
      expect(button(fixture).disabled).toBe(false);
      await fillAndSubmit(fixture);
      expect(fixture.componentInstance.registerForm().submitting()).toBe(true);
      expect(button(fixture).disabled).toBe(true);
      release();
      await finish(fixture);
      expect(button(fixture).disabled).toBe(false);
    });

    it('a server error appears on the field it names', async () => {
      const api = TestBed.inject(RegisterApi);
      api.reply = { field: 'username', message: 'Username taken' };
      const fixture = await mount(component);
      await fillAndSubmit(fixture);
      await finish(fixture);
      expect(errors(fixture, 'username')).toEqual(['Username taken']);
      expect(errors(fixture, 'email')).toEqual([]);
    });

    it('editing that field clears the server error', async () => {
      const api = TestBed.inject(RegisterApi);
      api.reply = { field: 'username', message: 'Username taken' };
      const fixture = await mount(component);
      await fillAndSubmit(fixture);
      await finish(fixture);
      expect(errors(fixture, 'username')).toEqual(['Username taken']);
      type(fixture, 'username', 'bob');
      await fixture.whenStable();
      expect(errors(fixture, 'username')).toEqual([]);
    });

    it('a second submit while one is running does not call the API again', async () => {
      const api = TestBed.inject(RegisterApi);
      const release = api.hold();
      const fixture = await mount(component);
      await fillAndSubmit(fixture);
      submitEvent(fixture);
      TestBed.tick();
      expect(api.calls.length).toBe(1);
      release();
      await finish(fixture);
      expect(api.calls.length).toBe(1);
    });
  });
});
