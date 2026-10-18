import { Component, input, model } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { type BaseHarnessFilters, ComponentHarness, HarnessPredicate, parallel } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MATERIAL_ANIMATIONS, MatOption } from '@angular/material/core';
import { MatOptionHarness } from '@angular/material/core/testing';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatSelectHarness } from '@angular/material/select/testing';

@Component({
  selector: 'lab-m36-rating',
  template: `
    <span class="lab-m36-rating-label">{{ label() }}</span>
    @for (star of stars; track star) {
      <button
        type="button"
        [attr.aria-label]="'Rate ' + star"
        [attr.aria-pressed]="star <= value()"
        [disabled]="disabled()"
        (click)="value.set(star)"
      ></button>
    }
  `,
})
class LabM36Rating {
  readonly label = input.required<string>();
  readonly value = model(0);
  readonly disabled = input(false);
  protected readonly stars = [1, 2, 3, 4, 5];
}

@Component({
  selector: 'lab-m36-rating-form',
  imports: [LabM36Rating],
  template: `
    <lab-m36-rating label="Service" [value]="4" />
    <lab-m36-rating label="Price" [value]="2" />
    <lab-m36-rating label="Delivery" [disabled]="true" />
  `,
})
class LabM36RatingForm {}

@Component({
  selector: 'lab-m36-fruit-select',
  imports: [ReactiveFormsModule, MatFormField, MatLabel, MatSelect, MatOption],
  template: `
    <mat-form-field>
      <mat-label>Fruit</mat-label>
      <mat-select [formControl]="fruit">
        @for (option of options; track option.value) {
          <mat-option [value]="option.value">{{ option.label }}</mat-option>
        }
      </mat-select>
    </mat-form-field>
  `,
})
class LabM36FruitSelect {
  readonly fruit = new FormControl<string | null>(null);
  protected readonly options = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
  ];
}

interface LabM36RatingFilters extends BaseHarnessFilters {
  label?: string | RegExp;
}

/** The test surface of `lab-m36-rating`: it speaks in labels and values and never exposes the buttons behind them. */
class LabM36RatingHarness extends ComponentHarness {
  static readonly hostSelector = 'lab-m36-rating';

  private readonly labelElement = this.locatorFor('.lab-m36-rating-label');
  private readonly stars = this.locatorForAll('button');

  static with(options: LabM36RatingFilters = {}): HarnessPredicate<LabM36RatingHarness> {
    return new HarnessPredicate(LabM36RatingHarness, options).addOption(
      'label',
      options.label,
      (harness, label) => HarnessPredicate.stringMatches(harness.getLabel(), label),
    );
  }

  async getLabel(): Promise<string> {
    return (await this.labelElement()).text();
  }

  async getValue(): Promise<number> {
    const stars = await this.stars();
    const pressed = await parallel(() => stars.map((star) => star.getAttribute('aria-pressed')));
    return pressed.filter((state) => state === 'true').length;
  }

  async setValue(value: number): Promise<void> {
    const star = (await this.stars()).at(value - 1);
    if (!star) {
      throw new Error(`No star ${value}`);
    }
    await star.click();
  }

  async isDisabled(): Promise<boolean> {
    const first = (await this.stars()).at(0);
    return (await first?.getProperty<boolean>('disabled')) ?? false;
  }
}

describe('Section 10: component harnesses', () => {
  it('Section 10: MatSelectHarness opens the overlay and selects an option by text', async () => {
    // Motion off, so closing the panel detaches it at once (the lab's rule for tests not about motion).
    TestBed.configureTestingModule({ providers: [{ provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } }] });
    const fixture = TestBed.createComponent(LabM36FruitSelect);
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const select = await loader.getHarness(MatSelectHarness);

    expect(await select.isOpen()).toBe(false);
    expect(await select.isEmpty()).toBe(true);

    await select.open();

    expect(await select.isOpen()).toBe(true);
    // The options live in the overlay container under `body`, outside the fixture's element:
    // a loader rooted at the fixture sees none, a loader rooted at the document sees all three.
    expect(await loader.getAllHarnesses(MatOptionHarness)).toHaveLength(0);
    const documentLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    const options = await documentLoader.getAllHarnesses(MatOptionHarness);
    expect(await parallel(() => options.map((option) => option.getText()))).toEqual(['Apple', 'Banana', 'Cherry']);

    await select.clickOptions({ text: 'Banana' });

    expect(fixture.componentInstance.fruit.value).toBe('banana');
    expect(await select.getValueText()).toBe('Banana');
    expect(await select.isOpen()).toBe(false);
  });

  it('Section 10: getHarnessOrNull returns null when nothing matches', async () => {
    const fixture = TestBed.createComponent(LabM36RatingForm);
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const missing = LabM36RatingHarness.with({ label: 'Missing' });

    expect(await loader.getHarnessOrNull(missing)).toBeNull();
    expect(await loader.hasHarness(missing)).toBe(false);
    expect(await loader.getAllHarnesses(missing)).toEqual([]);
    expect(await loader.getHarnessOrNull(MatSelectHarness)).toBeNull();
    expect(await loader.getHarnessOrNull(LabM36RatingHarness.with({ label: 'Price' }))).not.toBeNull();
  });

  it('Section 10: a failed getHarness names the query in its error', async () => {
    const fixture = TestBed.createComponent(LabM36RatingForm);
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const header = 'Failed to find element matching one of the following queries:\n';

    // A bare harness class: its name and host selector.
    await expect(loader.getHarness(MatSelectHarness)).rejects.toHaveProperty(
      'message',
      `${header}(${MatSelectHarness.name} with host element matching selector: "${MatSelectHarness.hostSelector}")`,
    );
    // A predicate adds its constraints, one `name = value` per option.
    await expect(loader.getHarness(LabM36RatingHarness.with({ label: 'Missing' }))).rejects.toHaveProperty(
      'message',
      `${header}(${LabM36RatingHarness.name} with host element matching selector: "lab-m36-rating" satisfying the constraints: label = "Missing")`,
    );
  });

  it('Section 10: a custom harness filters by label with a HarnessPredicate', async () => {
    const fixture = TestBed.createComponent(LabM36RatingForm);
    const loader = TestbedHarnessEnvironment.loader(fixture);

    const all = await loader.getAllHarnesses(LabM36RatingHarness);
    const price = await loader.getHarness(LabM36RatingHarness.with({ label: 'Price' }));
    const startingWithS = await loader.getAllHarnesses(LabM36RatingHarness.with({ label: /^S/ }));
    const delivery = await loader.getHarness(LabM36RatingHarness.with({ label: 'Delivery' }));

    expect(all).toHaveLength(3);
    expect(await price.getLabel()).toBe('Price');
    expect(await price.getValue()).toBe(2);
    expect(startingWithS).toHaveLength(1);
    expect(await startingWithS[0]?.getLabel()).toBe('Service');
    expect(await delivery.isDisabled()).toBe(true);
    expect(await price.isDisabled()).toBe(false);

    // The harness drives the component through its own methods, and the next read sees the result.
    await price.setValue(5);
    expect(await price.getValue()).toBe(5);
  });
});
