import { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbstractControl } from '@angular/forms';
import { LabM25SignupApi, SignupValue } from './signup-model';
import { LabM25SignupReactive, LabM25SignupReactiveBuilder } from './signup-reactive';
import { LabM25SignupTemplate } from './signup-template';

interface Rig {
  readonly fixture: ComponentFixture<unknown>;
  readonly api: LabM25SignupApi;
  /** The form model, read the way each version exposes it. */
  model(): AbstractControl;
  email(text: string): void;
  password(text: string): void;
  newsletter(): void;
  submit(): void;
}

function typeInto(root: HTMLElement, name: string, text: string): void {
  const field = root.querySelector<HTMLInputElement>(`input[name="${name}"]`)!;
  field.value = text;
  field.dispatchEvent(new Event('input'));
}

/** Renders a component, waits for the first stable render and wraps it in a rig. */
async function mount<T>(component: Type<T>, read: (instance: T) => AbstractControl): Promise<Rig> {
  const fixture = TestBed.createComponent(component);
  fixture.detectChanges();
  await fixture.whenStable();
  const root: HTMLElement = fixture.nativeElement;
  return {
    fixture,
    api: TestBed.inject(LabM25SignupApi),
    model: () => read(fixture.componentInstance),
    email: (text) => typeInto(root, 'email', text),
    password: (text) => typeInto(root, 'password', text),
    newsletter: () => {
      const box = root.querySelector<HTMLInputElement>('input[name="newsletter"]')!;
      box.checked = true;
      box.dispatchEvent(new Event('change'));
    },
    submit: () => root.querySelector('form')!.dispatchEvent(new Event('submit')),
  };
}

const template = () => mount(LabM25SignupTemplate, (c) => c.form().control);
const reactive = (type: Type<ReactiveSignup>) => mount(type, (c) => c.form);

interface ReactiveSignup {
  form: LabM25SignupReactive['form'];
}

// The solution and its NonNullableFormBuilder alternative must pass every reactive test below.
const REACTIVE_VARIANTS: Type<ReactiveSignup>[] = [LabM25SignupReactive, LabM25SignupReactiveBuilder];

/** A reactive component built without rendering it. */
function build<T>(component: Type<T>): T {
  return TestBed.runInInjectionContext(() => new component());
}

describe('E25.1 sign-up form twice', () => {
  it('both forms produce the same value object for the same typed input', async () => {
    const typed: SignupValue = { email: 'ann@example.com', password: 'longenough', newsletter: true };
    const rigs = [await template(), ...(await Promise.all(REACTIVE_VARIANTS.map(reactive)))];
    for (const rig of rigs) {
      rig.email(typed.email);
      rig.password(typed.password);
      rig.newsletter();
      expect(rig.model().value).toEqual(typed);
    }
  });

  it('both forms are invalid until the email and the password pass their validators', async () => {
    const rig = await template();
    expect(rig.model().valid).toBe(false);
    rig.email('ann@example.com');
    expect(rig.model().valid).toBe(false);
    rig.password('short');
    expect(rig.model().valid).toBe(false);
    rig.password('longenough');
    expect(rig.model().valid).toBe(true);
    for (const type of REACTIVE_VARIANTS) {
      const { form } = build(type);
      expect(form.valid).toBe(false);
      form.controls.email.setValue('ann@example.com');
      expect(form.valid).toBe(false);
      form.controls.password.setValue('short');
      expect(form.valid).toBe(false);
      form.controls.password.setValue('longenough');
      expect(form.valid).toBe(true);
    }
  });

  it('submitting a valid form calls the API once with the value, in both versions', async () => {
    const typed: SignupValue = { email: 'ann@example.com', password: 'longenough', newsletter: false };
    for (const open of [template, ...REACTIVE_VARIANTS.map((type) => () => reactive(type))]) {
      TestBed.resetTestingModule();
      const rig = await open();
      rig.email(typed.email);
      rig.password(typed.password);
      rig.submit();
      expect(rig.api.calls).toEqual([typed]);
    }
  });

  it('submitting an invalid form does not call the API, in both versions', async () => {
    for (const open of [template, ...REACTIVE_VARIANTS.map((type) => () => reactive(type))]) {
      TestBed.resetTestingModule();
      const rig = await open();
      rig.email('not-an-email');
      rig.password('longenough');
      rig.submit();
      expect(rig.api.calls).toEqual([]);
    }
  });

  it("the reactive form's value is available in the constructor and the template-driven form's only after the first stable render", async () => {
    const initial: SignupValue = { email: '', password: '', newsletter: false };
    for (const type of REACTIVE_VARIANTS) {
      expect(build(type).form.value).toEqual(initial);
    }
    const fixture = TestBed.createComponent(LabM25SignupTemplate);
    fixture.detectChanges();
    expect(fixture.componentInstance.form().value).toEqual({});
    await fixture.whenStable();
    expect(fixture.componentInstance.form().value).toEqual(initial);
  });

  it('the reactive spec runs the validation tests without rendering the component', () => {
    for (const type of REACTIVE_VARIANTS) {
      const { form } = build(type);
      expect(form.controls.email.errors).toEqual({ required: true });
      form.controls.email.setValue('ann');
      expect(form.controls.email.errors).toEqual({ email: true });
      form.controls.password.setValue('short');
      expect(form.controls.password.errors).toEqual({ minlength: { requiredLength: 8, actualLength: 5 } });
    }
    expect(document.querySelector('form')).toBeNull();
  });
});
