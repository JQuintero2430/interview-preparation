import { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { INITIAL_SIGNUP, Signup } from './signup-model';
import { LabM26SignupForm, LabM26SignupSchemaForm } from './signup-form';

interface SignupHost {
  readonly model: { (): Signup; set(value: Signup): void };
  readonly signupForm: { (): { valid(): boolean } };
}

async function mount<T extends SignupHost>(component: Type<T>): Promise<ComponentFixture<T>> {
  const fixture = TestBed.createComponent(component);
  fixture.autoDetectChanges();
  await fixture.whenStable();
  return fixture;
}

function input(fixture: ComponentFixture<unknown>, id: string): HTMLInputElement {
  return fixture.nativeElement.querySelector(`#${id}`) as HTMLInputElement;
}

function errors(fixture: ComponentFixture<unknown>, id: string): string[] {
  const nodes = fixture.nativeElement.querySelectorAll(`.${id}-error`) as NodeListOf<HTMLElement>;
  return Array.from(nodes, (n) => n.textContent ?? '');
}

async function type(fixture: ComponentFixture<unknown>, id: string, value: string): Promise<void> {
  const el = input(fixture, id);
  el.value = value;
  el.dispatchEvent(new Event('input'));
  await fixture.whenStable();
}

async function blur(fixture: ComponentFixture<unknown>, id: string): Promise<void> {
  input(fixture, id).dispatchEvent(new Event('blur'));
  await fixture.whenStable();
}

const variants: [string, Type<SignupHost>][] = [
  ['inline rules', LabM26SignupForm],
  ['exported schema', LabM26SignupSchemaForm],
];

describe('E26.1 sign-up form with form(), built-in rules and [formField]', () => {
  describe.each(variants)('%s', (_name, component) => {
    it('typing into each input updates the model signal', async () => {
      const fixture = await mount(component);
      await type(fixture, 'email', 'ann@example.com');
      await type(fixture, 'password', 'secret-pass');
      await type(fixture, 'age', '30');
      expect(fixture.componentInstance.model()).toEqual({ email: 'ann@example.com', password: 'secret-pass', age: 30 });
    });

    it('the age input writes a number to the model', async () => {
      const fixture = await mount(component);
      await type(fixture, 'age', '42');
      expect(typeof fixture.componentInstance.model().age).toBe('number');
      await type(fixture, 'age', '');
      expect(fixture.componentInstance.model().age).toBeNull();
    });

    it('the form is invalid until every rule passes', async () => {
      const fixture = await mount(component);
      const valid = () => fixture.componentInstance.signupForm().valid();
      expect(valid()).toBe(false);
      await type(fixture, 'email', 'ann@example.com');
      expect(valid()).toBe(false);
      await type(fixture, 'password', 'short');
      expect(valid()).toBe(false);
      await type(fixture, 'password', 'long-enough');
      expect(valid()).toBe(true);
      await type(fixture, 'age', '17');
      expect(valid()).toBe(false);
      await type(fixture, 'age', '18');
      expect(valid()).toBe(true);
    });

    it('an error message appears only after its field is touched', async () => {
      const fixture = await mount(component);
      await type(fixture, 'email', 'nope');
      expect(errors(fixture, 'email')).toEqual([]);
      await blur(fixture, 'email');
      expect(errors(fixture, 'email')).toHaveLength(1);
      expect(errors(fixture, 'password')).toEqual([]);
    });

    it('each error message comes from the error kind', async () => {
      const fixture = await mount(component);
      await blur(fixture, 'email');
      expect(errors(fixture, 'email')).toEqual(['This field is required']);
      await type(fixture, 'email', 'nope');
      expect(errors(fixture, 'email')).toEqual(['Enter a valid email address']);
      await type(fixture, 'password', 'abc');
      await blur(fixture, 'password');
      expect(errors(fixture, 'password')).toEqual(['Use at least 8 characters']);
      await type(fixture, 'age', '17');
      await blur(fixture, 'age');
      expect(errors(fixture, 'age')).toEqual(['You must be 18 or older']);
    });

    it('a model update from code repaints the inputs', async () => {
      const fixture = await mount(component);
      fixture.componentInstance.model.set({ ...INITIAL_SIGNUP, email: 'bo@example.com', password: 'abcdefgh', age: 25 });
      await fixture.whenStable();
      expect(input(fixture, 'email').value).toBe('bo@example.com');
      expect(input(fixture, 'password').value).toBe('abcdefgh');
      expect(input(fixture, 'age').value).toBe('25');
    });
  });
});
