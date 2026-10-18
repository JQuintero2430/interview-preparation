import { type BaseHarnessFilters, ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

export interface QuantityPickerFilters extends BaseHarnessFilters {
  label?: string | RegExp;
}

export class QuantityPickerHarness extends ComponentHarness {
  static readonly hostSelector = 'lab-m29-quantity-picker';

  private readonly group = this.locatorFor('[role="group"]');
  private readonly field = this.locatorFor('input');
  private readonly decrease = this.locatorFor('button[aria-label="Decrease"]');
  private readonly increase = this.locatorFor('button[aria-label="Increase"]');

  static with(options: QuantityPickerFilters = {}): HarnessPredicate<QuantityPickerHarness> {
    return new HarnessPredicate(QuantityPickerHarness, options).addOption(
      'label',
      options.label,
      (harness, label) => HarnessPredicate.stringMatches(harness.getLabel(), label),
    );
  }

  async getLabel(): Promise<string | null> {
    return (await this.group()).getAttribute('aria-label');
  }

  async getValue(): Promise<number> {
    return Number(await (await this.field()).getProperty<string>('value'));
  }

  async increment(): Promise<void> {
    await (await this.increase()).click();
  }

  async decrement(): Promise<void> {
    await (await this.decrease()).click();
  }

  async setValue(quantity: number): Promise<void> {
    const field = await this.field();
    await field.setInputValue(String(quantity));
    await field.dispatchEvent('change');
  }

  async isDecrementDisabled(): Promise<boolean> {
    return (await this.decrease()).getProperty<boolean>('disabled');
  }
}
