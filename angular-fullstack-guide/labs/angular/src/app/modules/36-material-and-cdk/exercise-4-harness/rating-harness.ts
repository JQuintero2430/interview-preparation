import { type BaseHarnessFilters, ComponentHarness, HarnessPredicate, parallel, type TestElement, TestKey } from '@angular/cdk/testing';

export interface RatingHarnessFilters extends BaseHarnessFilters {
  label?: string | RegExp;
}

/** A native radio reports `checked` as a property; an ARIA radio (a `div` or `span`) has no such property and reports `aria-checked`. */
async function isChecked(radio: TestElement): Promise<boolean> {
  return (await radio.getProperty<boolean | undefined>('checked')) ?? (await radio.getAttribute('aria-checked')) === 'true';
}

/**
 * The test surface of `lab-m36-rating`. It knows the two shapes a rating can take (a `fieldset` of native radios, or a
 * `radiogroup` of ARIA radios) and nothing else, so the same harness drives both rewrites.
 */
export class LabRatingHarness extends ComponentHarness {
  static readonly hostSelector = 'lab-m36-rating';

  private readonly group = this.locatorFor('fieldset, [role="radiogroup"]');
  private readonly legend = this.locatorForOptional('legend');
  private readonly radios = this.locatorForAll('input[type="radio"], [role="radio"]');

  static with(options: RatingHarnessFilters = {}): HarnessPredicate<LabRatingHarness> {
    return new HarnessPredicate(LabRatingHarness, options).addOption('label', options.label, (harness, label) =>
      HarnessPredicate.stringMatches(harness.getLabel(), label),
    );
  }

  async getLabel(): Promise<string> {
    const legend = await this.legend();
    return legend ? legend.text() : ((await (await this.group()).getAttribute('aria-label')) ?? '');
  }

  /** The selected value, or 0 when nothing is selected. */
  async getValue(): Promise<number> {
    const radios = await this.radios();
    const checked = await parallel(() => radios.map((radio) => isChecked(radio)));
    return checked.indexOf(true) + 1;
  }

  /** Presses the arrow key as many times as the distance from the current value to the wanted one. */
  async setValue(value: number): Promise<void> {
    const radios = await this.radios();
    if (!Number.isInteger(value) || value < 1 || value > radios.length) {
      throw new Error(`Rating must be between 1 and ${radios.length}, got ${value}`);
    }
    const steps = value - (await this.getValue());
    const key = steps > 0 ? TestKey.RIGHT_ARROW : TestKey.LEFT_ARROW;
    const presses = Array.from({ length: Math.abs(steps) }, () => key);
    const [first] = radios;
    if (first && presses.length > 0) {
      await first.sendKeys(...presses);
    }
  }

  async isDisabled(): Promise<boolean> {
    const [first] = await this.radios();
    if (!first) {
      return false;
    }
    return (await first.getProperty<boolean | undefined>('disabled')) ?? (await first.getAttribute('aria-disabled')) === 'true';
  }
}
