import { Component, inputBinding, input, linkedSignal, output, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { type BaseHarnessFilters, ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { fireEvent, render, screen } from '@testing-library/angular';

@Component({
  selector: 'lab-m29-quantity-picker',
  template:
    '<span class="lab-m29-label">{{ label() }}</span>' +
    '<button type="button" aria-label="Decrease" (click)="step(-1)">-</button>' +
    '<span class="lab-m29-value">{{ count() }}</span>' +
    '<button type="button" aria-label="Increase" (click)="step(1)">+</button>',
})
class LabM29QuantityPicker {
  readonly label = input('Quantity');
  readonly start = input(0);
  readonly changed = output<number>();
  protected readonly count = linkedSignal(() => this.start());

  protected step(by: number): void {
    this.count.update((value) => value + by);
    this.changed.emit(this.count());
  }
}

@Component({
  selector: 'lab-m29-picker-pair',
  imports: [LabM29QuantityPicker],
  template:
    '<lab-m29-quantity-picker label="Adults" [start]="2" />' +
    '<lab-m29-quantity-picker label="Children" [start]="1" />',
})
class LabM29PickerPair {}

interface LabM29PickerFilters extends BaseHarnessFilters {
  label?: string | RegExp;
}

class LabM29QuantityPickerHarness extends ComponentHarness {
  static readonly hostSelector = 'lab-m29-quantity-picker';

  private readonly increaseButton = this.locatorFor('button[aria-label="Increase"]');
  private readonly valueElement = this.locatorFor('.lab-m29-value');
  private readonly labelElement = this.locatorFor('.lab-m29-label');

  static with(options: LabM29PickerFilters = {}): HarnessPredicate<LabM29QuantityPickerHarness> {
    return new HarnessPredicate(LabM29QuantityPickerHarness, options).addOption(
      'label',
      options.label,
      (harness, label) => HarnessPredicate.stringMatches(harness.getLabel(), label),
    );
  }

  async increment(): Promise<void> {
    const button = await this.increaseButton();
    await button.click();
  }

  async getValue(): Promise<number> {
    const element = await this.valueElement();
    return Number(await element.text());
  }

  async getLabel(): Promise<string> {
    const element = await this.labelElement();
    return element.text();
  }
}

describe('Section 11: harnesses and Angular Testing Library', () => {
  it('Section 11: a harness reads and drives a component through its host', async () => {
    const fixture = TestBed.createComponent(LabM29QuantityPicker);
    fixture.componentRef.setInput('start', 3);
    const picker = await TestbedHarnessEnvironment.harnessForFixture(fixture, LabM29QuantityPickerHarness);

    expect(await picker.getValue()).toBe(3);

    await picker.increment();

    expect(await picker.getValue()).toBe(4);
  });

  it('Section 11: HarnessPredicate picks one harness among several', async () => {
    const fixture = TestBed.createComponent(LabM29PickerPair);
    const loader = TestbedHarnessEnvironment.loader(fixture);

    const all = await loader.getAllHarnesses(LabM29QuantityPickerHarness);
    const first = await loader.getHarness(LabM29QuantityPickerHarness);
    const children = await loader.getHarness(LabM29QuantityPickerHarness.with({ label: 'Children' }));

    expect(all.length).toBe(2);
    expect(await first.getLabel()).toBe('Adults');
    expect(await children.getLabel()).toBe('Children');
    expect(await children.getValue()).toBe(1);
  });

  it('Section 11: harness reads wait for the fixture to be stable', async () => {
    const start = signal(0);
    const fixture = TestBed.createComponent(LabM29QuantityPicker, {
      bindings: [inputBinding('start', start)],
    });
    const picker = await TestbedHarnessEnvironment.harnessForFixture(fixture, LabM29QuantityPickerHarness);
    const rawValue = (): string | null => fixture.nativeElement.querySelector('.lab-m29-value').textContent;
    expect(rawValue()).toBe('0');

    start.set(7);

    expect(rawValue()).toBe('0');
    expect(await picker.getValue()).toBe(7);
    expect(rawValue()).toBe('7');
  });

  it('Section 11: Testing Library finds a button by role and name', async () => {
    await render(LabM29QuantityPicker);

    const increase = screen.getByRole('button', { name: 'Increase' });

    expect(increase.textContent).toBe('+');
    expect(screen.getByRole('button', { name: 'Decrease' }).textContent).toBe('-');
    expect(screen.queryByRole('button', { name: '+' })).toBeNull();
  });

  it('Section 11: render with inputs and on wires a signal input and an output', async () => {
    const changes: number[] = [];

    await render(LabM29QuantityPicker, {
      inputs: { start: 5 },
      on: { changed: (value) => changes.push(value) },
    });
    expect(screen.getByText('5')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Increase' }));

    expect(screen.getByText('6')).toBeTruthy();
    expect(changes).toEqual([6]);
  });
});
