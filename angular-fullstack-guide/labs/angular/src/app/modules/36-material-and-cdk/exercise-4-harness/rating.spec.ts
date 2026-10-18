import { Component, type Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { LabM36Rating as LabM36RatingA } from './a/rating';
import { LabM36Rating as LabM36RatingB } from './b/rating';
import { LabRatingHarness } from './rating-harness';

@Component({
  selector: 'lab-m36-rating-host',
  imports: [LabM36RatingA],
  template: `
    <lab-m36-rating label="Service" [value]="4" />
    <lab-m36-rating label="Price" [value]="2" />
    <lab-m36-rating label="Comfort" />
    <lab-m36-rating label="Delivery" [disabled]="true" />
  `,
})
class LabM36RatingHost {}

/** Renders the host with the given variant (both share a selector) and returns a loader over it. */
function loaderFor(rating: Type<unknown>) {
  TestBed.overrideComponent(LabM36RatingHost, { remove: { imports: [LabM36RatingA] }, add: { imports: [rating] } });
  return TestbedHarnessEnvironment.loader(TestBed.createComponent(LabM36RatingHost));
}

describe.each([
  { variant: 'a', rating: LabM36RatingA },
  { variant: 'b', rating: LabM36RatingB },
])('Exercise 36.4 (variant $variant): the rating harness', ({ rating }) => {
  it('finds a rating by its label', async () => {
    const loader = loaderFor(rating);

    const price = await loader.getHarness(LabRatingHarness.with({ label: 'Price' }));

    expect(await price.getLabel()).toBe('Price');
    expect(await loader.getAllHarnesses(LabRatingHarness)).toHaveLength(4);
    expect(await loader.getAllHarnesses(LabRatingHarness.with({ label: /^[SD]/ }))).toHaveLength(2);
    expect(await loader.hasHarness(LabRatingHarness.with({ label: 'Missing' }))).toBe(false);
  });

  it('reads the selected value', async () => {
    const loader = loaderFor(rating);

    expect(await (await loader.getHarness(LabRatingHarness.with({ label: 'Service' }))).getValue()).toBe(4);
    expect(await (await loader.getHarness(LabRatingHarness.with({ label: 'Price' }))).getValue()).toBe(2);
    expect(await (await loader.getHarness(LabRatingHarness.with({ label: 'Comfort' }))).getValue()).toBe(0);
  });

  it('sets a value from the keyboard', async () => {
    const loader = loaderFor(rating);
    const price = await loader.getHarness(LabRatingHarness.with({ label: 'Price' }));
    const comfort = await loader.getHarness(LabRatingHarness.with({ label: 'Comfort' }));

    await price.setValue(5);
    expect(await price.getValue()).toBe(5);
    await price.setValue(1);
    expect(await price.getValue()).toBe(1);
    await comfort.setValue(3);
    expect(await comfort.getValue()).toBe(3);

    await expect(price.setValue(6)).rejects.toHaveProperty('message', 'Rating must be between 1 and 5, got 6');
    expect(await price.getValue()).toBe(1);
  });

  it('reports a disabled rating as disabled', async () => {
    const loader = loaderFor(rating);

    expect(await (await loader.getHarness(LabRatingHarness.with({ label: 'Delivery' }))).isDisabled()).toBe(true);
    expect(await (await loader.getHarness(LabRatingHarness.with({ label: 'Price' }))).isDisabled()).toBe(false);
  });
});
