import { type Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MATERIAL_ANIMATIONS } from '@angular/material/core';
import { MatInputHarness } from '@angular/material/input/testing';
import { MatSelectHarness } from '@angular/material/select/testing';
import { LabM36Rating as LabM36RatingA } from './a/rating';
import { LabM36Rating as LabM36RatingB } from './b/rating';
import { LabM36ProfileForm } from './profile-form';
import { LabRatingHarness } from './rating-harness';

describe.each([
  { variant: 'a', rating: LabM36RatingA },
  { variant: 'b', rating: LabM36RatingB },
])('Exercise 36.4 (variant $variant): the profile form', ({ rating }) => {
  /** The form imports variant a; this swaps in the variant under test. */
  function createForm(variantRating: Type<unknown>) {
    TestBed.configureTestingModule({ providers: [{ provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } }] });
    TestBed.overrideComponent(LabM36ProfileForm, { remove: { imports: [LabM36RatingA] }, add: { imports: [variantRating] } });
    return TestBed.createComponent(LabM36ProfileForm);
  }

  it('submits the profile form through harnesses only', async () => {
    const fixture = createForm(rating);
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const name = await loader.getHarness(MatInputHarness);
    const plan = await loader.getHarness(MatSelectHarness);
    const satisfaction = await loader.getHarness(LabRatingHarness.with({ label: 'Satisfaction' }));
    const save = await loader.getHarness(MatButtonHarness.with({ text: 'Save profile' }));

    // An empty form does not submit.
    await save.click();
    expect(fixture.componentInstance.submitted()).toBeNull();

    await name.setValue('Ada Lovelace');
    await plan.clickOptions({ text: 'Pro' });
    await satisfaction.setValue(4);
    expect(await name.getValue()).toBe('Ada Lovelace');
    expect(await plan.getValueText()).toBe('Pro');
    expect(await satisfaction.getValue()).toBe(4);

    await save.click();
    expect(fixture.componentInstance.submitted()).toEqual({ name: 'Ada Lovelace', plan: 'Pro', rating: 4 });
  });
});
