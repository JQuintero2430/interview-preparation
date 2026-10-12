import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LabM25DynamicForm, LabM25DynamicFormEvents } from './dynamic-form';
import { LAB_M25_SAMPLE_CONFIG } from './field-config';

// The signal-of-rows solution and its events-plus-markForCheck alternative must pass every test below.
const VARIANTS: Type<LabM25DynamicForm | LabM25DynamicFormEvents>[] = [LabM25DynamicForm, LabM25DynamicFormEvents];

interface Rig {
  readonly host: LabM25DynamicForm | LabM25DynamicFormEvents;
  readonly root: HTMLElement;
  /** The email inputs, one per contact row, in order. */
  emails(): HTMLInputElement[];
  type(input: HTMLInputElement, text: string): Promise<void>;
  choose(select: HTMLSelectElement, value: string): Promise<void>;
  click(selector: string, index?: number): Promise<void>;
  fillValid(): Promise<void>;
}

async function mount(variant: Type<LabM25DynamicForm | LabM25DynamicFormEvents>): Promise<Rig> {
  TestBed.resetTestingModule();
  const fixture = TestBed.createComponent(variant);
  fixture.autoDetectChanges();
  await fixture.whenStable();
  const root: HTMLElement = fixture.nativeElement;
  const emails = () => Array.from(root.querySelectorAll<HTMLInputElement>('fieldset input[type=text]'));
  const rig: Rig = {
    host: fixture.componentInstance,
    root,
    emails,
    type: async (input, text) => {
      input.value = text;
      input.dispatchEvent(new Event('input'));
      await fixture.whenStable();
    },
    choose: async (select, value) => {
      select.value = value;
      select.dispatchEvent(new Event('change'));
      await fixture.whenStable();
    },
    click: async (selector, index = 0) => {
      root.querySelectorAll<HTMLButtonElement>(selector)[index].click();
      await fixture.whenStable();
    },
    fillValid: async () => {
      await rig.type(root.querySelector<HTMLInputElement>('div input[type=text]')!, 'Ada');
      await rig.choose(root.querySelector<HTMLSelectElement>('div select')!, 'CO');
      await rig.type(emails()[0], 'ada@example.com');
    },
  };
  return rig;
}

function eachVariant(body: (rig: Rig) => Promise<void>): () => Promise<void> {
  return async () => {
    for (const variant of VARIANTS) await body(await mount(variant));
  };
}

describe('E25.5 config-driven form with a repeatable FormArray section', () => {
  it('every configured field renders with its label and validators', eachVariant(async ({ host, root, type }) => {
    const labels = Array.from(root.querySelectorAll('label > span')).map((span) => span.textContent);
    const configured = [...LAB_M25_SAMPLE_CONFIG.fields, ...LAB_M25_SAMPLE_CONFIG.section.fields];
    expect(labels).toEqual(configured.map((field) => field.label));
    expect(Array.from(root.querySelectorAll('option')).map((option) => option.value)).toEqual(['ES', 'CO', 'MX', 'work', 'home']);
    const { name, age, country } = host.form.controls.fields.controls;
    expect([name.hasError('required'), country.hasError('required')]).toEqual([true, true]);
    await type(root.querySelector<HTMLInputElement>('input[type=number]')!, '17');
    expect(age.errors).toEqual({ min: { min: 18, actual: 17 } });
  }));

  it('a number field yields a number value', eachVariant(async ({ host, root, type }) => {
    await type(root.querySelector<HTMLInputElement>('input[type=number]')!, '30');
    expect(host.form.controls.fields.value['age']).toBe(30);
  }));

  it("adding a contact renders a new row, and the form's value includes it", eachVariant(async ({ click, emails, host, type }) => {
    expect(emails()).toHaveLength(1);
    await click('.add');
    expect(emails()).toHaveLength(2);
    await type(emails()[1], 'second@example.com');
    expect(host.form.getRawValue().section).toEqual([
      { email: '', kind: '' },
      { email: 'second@example.com', kind: '' },
    ]);
  }));

  it("removing the first contact keeps the other rows' values in their inputs", eachVariant(async ({ click, emails, host, type }) => {
    await click('.add');
    await click('.add');
    for (const [index, input] of emails().entries()) await type(input, `${'abc'[index]}@example.com`);
    const before = emails();
    await click('.remove');
    const after = emails();
    expect(after).toEqual([before[1], before[2]]);
    expect(after.map((input) => input.value)).toEqual(['b@example.com', 'c@example.com']);
    await type(after[0], 'x@example.com');
    expect(host.form.getRawValue().section.map((row) => row['email'])).toEqual(['x@example.com', 'c@example.com']);
  }));

  it('the contacts section requires at least one row', eachVariant(async ({ click, emails, fillValid, host, root, type }) => {
    await fillValid();
    expect(host.form.valid).toBe(true);
    await click('.remove');
    expect(emails()).toHaveLength(0);
    expect(host.form.controls.section.errors).toEqual({ minRows: { required: 1, actual: 0 } });
    expect(host.form.invalid).toBe(true);
    await click('.save');
    expect(host.submitted()).toBeNull();
    await click('.add');
    await type(emails()[0], 'again@example.com');
    expect(host.form.controls.section.errors).toBeNull();
    expect(root.querySelectorAll('fieldset > div')).toHaveLength(1);
  }));

  it("the submitted value matches the configuration's keys", eachVariant(async ({ click, fillValid, host }) => {
    await fillValid();
    await click('.save');
    const submitted = host.submitted()!;
    const { fields, section } = LAB_M25_SAMPLE_CONFIG;
    expect(Object.keys(submitted)).toEqual([...fields.map((field) => field.key), section.key]);
    const contacts = submitted[section.key] as Record<string, unknown>[];
    expect(contacts.map((contact) => Object.keys(contact))).toEqual([section.fields.map((field) => field.key)]);
    expect(submitted).toEqual({
      name: 'Ada',
      age: null,
      country: 'CO',
      contacts: [{ email: 'ada@example.com', kind: '' }],
    });
  }));
});
