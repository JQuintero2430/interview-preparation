import { reflectComponentType } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LegacyRating } from './legacy/legacy-rating';
import { Rating } from './rating';
import { LegacyRatingHost, RatingHost } from './rating-host';

const textOf = (fixture: ComponentFixture<unknown>): string =>
  (fixture.nativeElement as HTMLElement).textContent?.replace(/\s+/g, ' ').trim() ?? '';

const click = (fixture: ComponentFixture<unknown>, selector: string): void => {
  (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(selector)?.click();
  fixture.detectChanges();
};

describe('E19.1 Move a decorator rating component to signal APIs', () => {
  it('the migrated component renders the same text as the legacy one for the same bindings (up to whitespace)', () => {
    const legacy = TestBed.createComponent(LegacyRatingHost);
    const migrated = TestBed.createComponent(RatingHost);
    legacy.detectChanges();
    migrated.detectChanges();
    expect(textOf(migrated)).toBe(textOf(legacy));
    expect(textOf(migrated)).toContain('Quality');
    expect(textOf(migrated)).toContain('slots=2');
  });

  it('max and readonly written as plain attributes arrive as a number and a boolean', () => {
    const fixture = TestBed.createComponent(RatingHost);
    fixture.detectChanges();
    const rating = fixture.debugElement.children[0].componentInstance as Rating;
    expect(rating.max()).toBe(10);
    expect(rating.readonly()).toBe(true);
  });

  it('[(value)] writes the parent signal when the user rates, and a parent write shows in the child', () => {
    const fixture = TestBed.createComponent(RatingHost);
    fixture.detectChanges();
    expect(textOf(fixture)).toContain('value=3');
    click(fixture, '.top');
    expect(fixture.componentInstance.value()).toBe(10);
    fixture.componentInstance.value.set(7);
    fixture.detectChanges();
    expect(textOf(fixture)).toContain('value=7');
  });

  it('closed is emitted once per click and not at construction', () => {
    const fixture = TestBed.createComponent(RatingHost);
    fixture.detectChanges();
    expect(fixture.componentInstance.closes()).toBe(0);
    click(fixture, '.close');
    expect(fixture.componentInstance.closes()).toBe(1);
    click(fixture, '.close');
    expect(fixture.componentInstance.closes()).toBe(2);
  });

  it('the heading query is found in ngOnInit', () => {
    const fixture = TestBed.createComponent(RatingHost);
    fixture.detectChanges();
    expect(textOf(fixture)).toContain('tag=H4');
  });

  it('reflectComponentType(Rating).inputs are all signal inputs', () => {
    const inputs = reflectComponentType(Rating)?.inputs ?? [];
    expect(inputs.map((i) => i.templateName).sort()).toEqual(['label', 'max', 'readonly', 'tone', 'value']);
    expect(inputs.every((i) => i.isSignal)).toBe(true);
    // The same check fails on the legacy component, so it can tell the two apart.
    expect(reflectComponentType(LegacyRating)?.inputs.some((i) => i.isSignal)).toBe(false);
  });
});
