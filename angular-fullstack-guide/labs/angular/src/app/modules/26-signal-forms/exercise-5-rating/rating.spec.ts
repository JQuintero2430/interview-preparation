import { Type } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SignalFormControl } from '@angular/forms/signals/compat';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LabM26LegacyNamedReviewForm, LabM26LegacyReviewForm } from './legacy-review-form';
import { LabM26ReviewForm } from './review-form';

async function mount<T>(component: Type<T>): Promise<ComponentFixture<T>> {
  const fixture = TestBed.createComponent(component);
  fixture.autoDetectChanges();
  await fixture.whenStable();
  return fixture;
}

function stars(fixture: ComponentFixture<unknown>): HTMLButtonElement[] {
  return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('.star'));
}

function errorKinds(fixture: ComponentFixture<unknown>): string[] {
  const nodes = (fixture.nativeElement as HTMLElement).querySelectorAll('.rating-error');
  return Array.from(nodes, (n) => n.textContent?.trim() ?? '');
}

describe('E26.5 a rating control with FormValueControl', () => {
  it('clicking a star writes its number to the model', async () => {
    const fixture = await mount(LabM26ReviewForm);
    expect(stars(fixture)).toHaveLength(4);
    stars(fixture)[2].click();
    await fixture.whenStable();
    expect(fixture.componentInstance.model().rating).toBe(3);
    expect(fixture.componentInstance.reviewForm.rating().dirty()).toBe(true);
    expect(stars(fixture).filter((s) => s.classList.contains('on'))).toHaveLength(3);
  });

  it('leaving the control marks the field touched', async () => {
    const fixture = await mount(LabM26ReviewForm);
    const rating = fixture.componentInstance.reviewForm.rating;
    expect(rating().touched()).toBe(false);
    stars(fixture)[0].dispatchEvent(new Event('blur'));
    await fixture.whenStable();
    expect(rating().touched()).toBe(true);
    expect(rating().dirty()).toBe(false);
  });

  it('a disabled field disables the stars and the control shows no errors', async () => {
    const fixture = await mount(LabM26ReviewForm);
    expect(errorKinds(fixture)).toEqual(['min']);
    fixture.componentInstance.model.update((m) => ({ ...m, locked: true }));
    await fixture.whenStable();
    expect(stars(fixture).every((s) => s.disabled)).toBe(true);
    expect(errorKinds(fixture)).toEqual([]);
  });

  it('a rating of 0 is invalid with a min error', async () => {
    const fixture = await mount(LabM26ReviewForm);
    const rating = fixture.componentInstance.reviewForm.rating;
    expect(rating().invalid()).toBe(true);
    expect(rating().errors().map((e) => e.kind)).toEqual(['min']);
    stars(fixture)[0].click();
    await fixture.whenStable();
    expect(rating().valid()).toBe(true);
    expect(rating().errors()).toEqual([]);
  });

  const groupHosts: [string, Type<{ group: FormGroup; rating: SignalFormControl<number> }>][] = [
    ['formField', LabM26LegacyReviewForm],
    ['formControlName', LabM26LegacyNamedReviewForm],
  ];

  describe.each(groupHosts)('reactive FormGroup bound with %s', (_name, host) => {
    it('inside the reactive FormGroup the rating\'s validity reaches the group status', async () => {
      const fixture = await mount(host);
      const { group, rating } = fixture.componentInstance;
      expect(rating.status).toBe('INVALID');
      expect(group.status).toBe('INVALID');
      stars(fixture)[3].click();
      await fixture.whenStable();
      expect(group.value).toEqual({ rating: 4 });
      expect(rating.status).toBe('VALID');
      expect(group.status).toBe('VALID');
    });
  });
});
