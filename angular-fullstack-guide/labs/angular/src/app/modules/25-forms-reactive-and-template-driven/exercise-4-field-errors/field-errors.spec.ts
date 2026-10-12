import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LabM25CheckoutForm, LabM25CheckoutFormTouched, PASSWORD_MIN_LENGTH } from './checkout-form';

// The solution and its markAllAsTouched alternative must pass every test below.
const VARIANTS: Type<unknown>[] = [LabM25CheckoutForm, LabM25CheckoutFormTouched];

interface Rig {
  readonly root: HTMLElement;
  field(id: string): HTMLInputElement;
  type(id: string, value: string): Promise<void>;
  blur(id: string): Promise<void>;
  submit(): Promise<void>;
  /** The message texts rendered next to one field. */
  messages(id: string): string[];
}

async function mount(variant: Type<unknown>): Promise<Rig> {
  TestBed.resetTestingModule();
  const fixture = TestBed.createComponent(variant);
  fixture.autoDetectChanges();
  await fixture.whenStable();
  const root: HTMLElement = fixture.nativeElement;
  const field = (id: string) => root.querySelector<HTMLInputElement>(`#${id}`)!;
  return {
    root,
    field,
    type: async (id, value) => {
      field(id).value = value;
      field(id).dispatchEvent(new Event('input'));
      await fixture.whenStable();
    },
    blur: async (id) => {
      field(id).dispatchEvent(new Event('blur'));
      await fixture.whenStable();
    },
    submit: async () => {
      root.querySelector('button')?.click();
      await fixture.whenStable();
    },
    messages: (id) => Array.from(root.querySelectorAll(`#${id}-errors li`)).map((li) => li.textContent ?? ''),
  };
}

function eachVariant(body: (rig: Rig) => Promise<void>): () => Promise<void> {
  return async () => {
    for (const variant of VARIANTS) await body(await mount(variant));
  };
}

describe('E25.4 accessible field errors', () => {
  it('no error shows before the user leaves the field or submits', eachVariant(async ({ root, type }) => {
    expect(root.querySelectorAll('li')).toHaveLength(0);
    await type('name', 'x');
    await type('name', '');
    expect(root.querySelectorAll('li')).toHaveLength(0);
    expect(root.querySelector('[aria-invalid]')).toBeNull();
  }));

  it('leaving an invalid field shows its message', eachVariant(async ({ blur, messages }) => {
    await blur('name');
    expect(messages('name')).toEqual(['Required']);
    expect(messages('password')).toEqual([]);
  }));

  it("submitting shows every invalid field's message", eachVariant(async ({ messages, submit }) => {
    await submit();
    expect(messages('name')).toEqual(['Required']);
    expect(messages('password')).toEqual(['Required']);
  }));

  it('each invalid input has aria-invalid true and aria-describedby pointing at its message', eachVariant(async ({ field, root, submit }) => {
    await submit();
    for (const id of ['name', 'password']) {
      expect(field(id).getAttribute('aria-invalid')).toBe('true');
      const describedBy = field(id).getAttribute('aria-describedby')!;
      expect(root.querySelector(`#${describedBy}`)?.textContent).toBe('Required');
    }
  }));

  it('submitting an invalid form focuses the first invalid input', eachVariant(async ({ field, submit, type }) => {
    await submit();
    expect(document.activeElement).toBe(field('name'));
    await type('name', 'Ada');
    await submit();
    expect(document.activeElement).toBe(field('password'));
  }));

  it('the minlength message includes the required length from the error payload', eachVariant(async ({ blur, messages, type }) => {
    await type('password', 'abc');
    await blur('password');
    expect(messages('password')).toEqual([`At least ${PASSWORD_MIN_LENGTH} characters`]);
  }));
});
