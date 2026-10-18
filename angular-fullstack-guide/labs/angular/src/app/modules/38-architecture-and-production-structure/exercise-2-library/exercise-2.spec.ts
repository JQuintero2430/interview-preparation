import { EnvironmentProviders, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UiStatusPill as PillA, provideUiStatus as provideA } from 'ui-lib/ex2-a';
import { UiStatusPill as PillB, provideUiStatus as provideB } from 'ui-lib/ex2-b';

// Needs `npx ng build ui-lib` first: both subpaths resolve to dist/ui-lib.
const variants: readonly (readonly [string, Type<unknown>, (c: { labels: Record<string, string> }) => EnvironmentProviders])[] = [
  ['ex2-a (named re-exports)', PillA, provideA],
  ['ex2-b (api barrel)', PillB, provideB],
];

describe.each(variants)('Exercise 38.2 · entry point %s', (_name, Pill, provide) => {
  const text = async (): Promise<string | null | undefined> => {
    const fixture = TestBed.createComponent(Pill);
    fixture.componentRef.setInput('status', 'ready');
    await fixture.whenStable();
    return (fixture.nativeElement as HTMLElement).querySelector('span.ui-status-pill')?.textContent;
  };

  it('renders the status pill in an app that imports the entry point by package name', async () => {
    expect(await text()).toBe('Ready');
  });

  it('applies the configuration given to the provide function', async () => {
    TestBed.configureTestingModule({ providers: [provide({ labels: { ready: 'Listo' } })] });
    expect(await text()).toBe('Listo');
  });
});
