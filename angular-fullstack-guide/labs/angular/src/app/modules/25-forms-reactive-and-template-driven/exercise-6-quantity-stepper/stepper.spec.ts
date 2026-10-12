import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LabM25OrderForm, LabM25OrderFormSplit } from './order-form';
import { LabM25OrderTemplate, LabM25OrderTemplateSplit } from './order-template';
import { LabM25OrderHost } from './quantity-stepper';

// The solution and its split-validator alternative, each in a reactive and in a template-driven host.
const VARIANTS: Type<LabM25OrderHost>[] = [
  LabM25OrderForm,
  LabM25OrderTemplate,
  LabM25OrderFormSplit,
  LabM25OrderTemplateSplit,
];

async function mount(variant: Type<LabM25OrderHost>) {
  TestBed.resetTestingModule();
  const fixture = TestBed.createComponent(variant);
  fixture.autoDetectChanges();
  await fixture.whenStable();
  await fixture.whenStable(); // ngModel writes its first value one microtask later (section 4)
  const root: HTMLElement = fixture.nativeElement;
  const [minus, plus] = Array.from(root.querySelectorAll('button'));
  return {
    host: fixture.componentInstance,
    control: fixture.componentInstance.control(),
    minus,
    plus,
    readout: () => root.querySelector('output')?.textContent,
    settle: () => fixture.whenStable(),
  };
}

type Rig = Awaited<ReturnType<typeof mount>>;

function eachVariant(body: (rig: Rig) => Promise<void>): () => Promise<void> {
  return async () => {
    for (const variant of VARIANTS) await body(await mount(variant));
  };
}

/** Everything a user or a parent can see after the same five steps. */
async function trace(variant: Type<LabM25OrderHost>) {
  const { control, plus, minus, readout, settle } = await mount(variant);
  const snapshot = () => ({
    readout: readout(),
    value: control.value,
    dirty: control.dirty,
    touched: control.touched,
    errors: control.errors,
    disabled: [minus.disabled, plus.disabled],
  });
  const steps = [snapshot()];
  plus.click();
  await settle();
  steps.push(snapshot());
  plus.dispatchEvent(new Event('blur'));
  control.setValue(11);
  await settle();
  steps.push(snapshot());
  control.disable();
  await settle();
  steps.push(snapshot());
  return steps;
}

describe('E25.6 quantity stepper', () => {
  it('the stepper shows the control\'s initial value and setValue updates it', eachVariant(async ({ control, readout, settle }) => {
    expect(readout()).toBe('3');
    control.setValue(7);
    await settle();
    expect(readout()).toBe('7');
  }));

  it('clicking plus updates the control and marks it dirty', eachVariant(async ({ control, plus, readout, settle }) => {
    expect(control.dirty).toBe(false);
    plus.click();
    await settle();
    expect(control.value).toBe(4);
    expect(control.dirty).toBe(true);
    expect(readout()).toBe('4');
  }));

  it('leaving the stepper marks the control touched', eachVariant(async ({ control, plus }) => {
    expect(control.touched).toBe(false);
    plus.dispatchEvent(new Event('blur'));
    expect(control.touched).toBe(true);
  }));

  it('disabling the control disables both buttons', eachVariant(async ({ control, minus, plus, settle }) => {
    control.disable();
    await settle();
    expect([minus.disabled, plus.disabled]).toEqual([true, true]);
    control.enable();
    await settle();
    expect([minus.disabled, plus.disabled]).toEqual([false, false]);
  }));

  it('a value above max puts a range error on the control', eachVariant(async ({ control, host, settle }) => {
    expect(control.errors).toBeNull();
    control.setValue(11);
    expect(control.errors).toEqual({ range: { min: 1, max: 10, actual: 11 } });
    control.setValue(3);
    host.max.set(2);
    await settle();
    expect(control.errors).toEqual({ range: { min: 1, max: 2, actual: 3 } });
  }));

  it('the stepper works the same with formControlName and with ngModel', async () => {
    const reference = await trace(LabM25OrderForm);
    expect(reference[3]).toMatchObject({ disabled: [true, true], errors: null });
    for (const variant of VARIANTS.slice(1)) expect(await trace(variant)).toEqual(reference);
  });
});
