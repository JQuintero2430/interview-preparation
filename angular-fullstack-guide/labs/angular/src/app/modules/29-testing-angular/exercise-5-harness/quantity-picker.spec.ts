import { TestBed } from '@angular/core/testing';
import { type HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { fireEvent, render, screen, within } from '@testing-library/angular';
import {
  LabM29PickerHost,
  type PickerHandle,
  type QuantityPickerDriver,
} from './quantity-picker-driver';
import { QuantityPickerHarness } from './quantity-picker-harness';

function createHarnessDriver(): QuantityPickerDriver {
  let loader: HarnessLoader | undefined;
  return {
    mount: async (pickers) => {
      const fixture = TestBed.createComponent(LabM29PickerHost);
      fixture.componentRef.setInput('pickers', pickers);
      await fixture.whenStable();
      loader = TestbedHarnessEnvironment.loader(fixture);
    },
    picker: async (label) => {
      if (loader === undefined) {
        throw new Error('mount first');
      }
      return loader.getHarness(QuantityPickerHarness.with({ label }));
    },
  };
}

function createTestingLibraryDriver(): QuantityPickerDriver {
  let settle: () => Promise<void> = () => Promise.resolve();
  return {
    mount: async (pickers) => {
      const { fixture } = await render(LabM29PickerHost, { inputs: { pickers } });
      settle = () => fixture.whenStable();
    },
    picker: (label): Promise<PickerHandle> => {
      const picker = within(screen.getByRole('group', { name: label }));
      const field = (): HTMLInputElement => picker.getByRole<HTMLInputElement>('spinbutton');
      const decrease = (): HTMLButtonElement =>
        picker.getByRole<HTMLButtonElement>('button', { name: 'Decrease' });
      const act = async (run: () => void): Promise<void> => {
        run();
        await settle();
      };
      return Promise.resolve({
        getValue: async () => {
          await settle();
          return Number(field().value);
        },
        increment: () =>
          act(() => fireEvent.click(picker.getByRole('button', { name: 'Increase' }))),
        decrement: () => act(() => fireEvent.click(decrease())),
        setValue: (quantity) =>
          act(() => fireEvent.change(field(), { target: { value: String(quantity) } })),
        isDecrementDisabled: async () => {
          await settle();
          return decrease().disabled;
        },
      });
    },
  };
}

describe.each<[string, () => QuantityPickerDriver]>([
  ['harness', createHarnessDriver],
  ['Testing Library', createTestingLibraryDriver],
])('E29.5 quantity picker (%s)', (_name, createDriver) => {
  it('reads the current quantity', async () => {
    const driver = createDriver();
    await driver.mount([{ label: 'Seats', value: 4 }]);

    const seats = await driver.picker('Seats');

    expect(await seats.getValue()).toBe(4);
  });

  it('increments and decrements by one', async () => {
    const driver = createDriver();
    await driver.mount([{ label: 'Seats', value: 3 }]);
    const seats = await driver.picker('Seats');

    await seats.increment();
    expect(await seats.getValue()).toBe(4);

    await seats.decrement();
    await seats.decrement();
    expect(await seats.getValue()).toBe(2);
  });

  it('disables decrease at the minimum', async () => {
    const driver = createDriver();
    await driver.mount([{ label: 'Seats', value: 2, min: 1 }]);
    const seats = await driver.picker('Seats');
    expect(await seats.isDecrementDisabled()).toBe(false);

    await seats.decrement();

    expect(await seats.getValue()).toBe(1);
    expect(await seats.isDecrementDisabled()).toBe(true);
  });

  it('clamps a typed value to the maximum', async () => {
    const driver = createDriver();
    await driver.mount([{ label: 'Seats', value: 2, max: 10 }]);
    const seats = await driver.picker('Seats');

    await seats.setValue(99);

    expect(await seats.getValue()).toBe(10);
  });

  it('finds one picker among several by its label', async () => {
    const driver = createDriver();
    await driver.mount([
      { label: 'Adults', value: 2 },
      { label: 'Children', value: 5 },
    ]);

    const children = await driver.picker('Children');
    const adults = await driver.picker('Adults');
    await children.increment();

    expect(await children.getValue()).toBe(6);
    expect(await adults.getValue()).toBe(2);
  });
});
