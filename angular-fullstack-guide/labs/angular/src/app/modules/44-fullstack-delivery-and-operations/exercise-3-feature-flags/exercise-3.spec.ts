// Exercise 44.3: both variants against the same six criteria. Zoneless TestBed, our MemoryFlagProvider as the flag
// backend, a spy that counts provider calls. No clock, no random source, no network.
import { type Type, provideZonelessChangeDetection } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { FlagService } from './a/flag.service';
import { FlagStore } from './b/flag.store';
import { Checkout } from './checkout';
import { FLAGS, FLAG_PROVIDER, type FlagDefinition, type FlagReader, MemoryFlagProvider } from './flags';

type Variant = 'a' | 'b';
const VARIANTS: readonly Variant[] = ['a', 'b'];
const READERS: Record<Variant, Type<FlagReader>> = { a: FlagService, b: FlagStore };

/** Bucket 530 of 10,000 for `new-checkout`: inside a 10% rollout. */
const IN_ROLLOUT = 'user-28';
/** Bucket 2,269 for `new-checkout`: outside it. */
const OUT_OF_ROLLOUT = 'user-42';

const NEW_CHECKOUT: FlagDefinition = {
  variants: { on: true, off: false },
  defaultVariant: 'off',
  disabled: false,
  rollout: { percent: 10, variant: 'on' },
};
const EXPRESS_PAY: FlagDefinition = { variants: { on: true, off: false }, defaultVariant: 'on', disabled: false };

function setUp(variant: Variant): { reader: FlagReader; provider: MemoryFlagProvider } {
  const provider = new MemoryFlagProvider({ 'new-checkout': NEW_CHECKOUT, 'express-pay': EXPRESS_PAY });
  TestBed.configureTestingModule({
    providers: [
      provideZonelessChangeDetection(),
      { provide: FLAG_PROVIDER, useValue: provider },
      { provide: FLAGS, useExisting: READERS[variant] },
    ],
  });
  return { reader: TestBed.inject(FLAGS), provider };
}

function render(fixture: ComponentFixture<Checkout>): void {
  TestBed.tick();
  fixture.detectChanges();
}

function checkoutOf(fixture: ComponentFixture<Checkout>): string | null {
  const host: HTMLElement = fixture.nativeElement;
  return host.querySelector('[data-checkout]')?.getAttribute('data-checkout') ?? null;
}

describe.each(VARIANTS)('Exercise 44.3 variant %s', (variant) => {
  it('gives the same targeting key the same variant every time, and the rollout variant to its percentage of 10,000 keys within one point', () => {
    const { reader } = setUp(variant);
    const details = TestBed.runInInjectionContext(() => reader.details('new-checkout', false));
    const seen: (string | undefined)[] = [];
    for (let round = 0; round < 3; round++) {
      reader.setContext({ targetingKey: OUT_OF_ROLLOUT });
      reader.setContext({ targetingKey: IN_ROLLOUT });
      seen.push(details().variant);
    }
    expect(seen).toEqual(['on', 'on', 'on']);

    let on = 0;
    for (let index = 0; index < 10_000; index++) {
      reader.setContext({ targetingKey: `user-${index}` });
      on += Number(details().value);
    }
    expect(Math.abs(on / 100 - 10)).toBeLessThanOrEqual(1);
  });

  it('returns the default value with a reason naming the missing targeting key before login', () => {
    const { reader } = setUp(variant);
    const details = TestBed.runInInjectionContext(() => reader.details('new-checkout', true));
    expect(details()).toEqual({ value: true, reason: 'ERROR', errorCode: 'TARGETING_KEY_MISSING' });
  });

  it('re-evaluates every flag the template reads once when the context changes after login', () => {
    const { reader, provider } = setUp(variant);
    const resolve = vi.spyOn(provider, 'resolveBoolean');
    const fixture = TestBed.createComponent(Checkout);
    render(fixture);
    resolve.mockClear();

    reader.setContext({ targetingKey: IN_ROLLOUT });
    render(fixture);
    expect(resolve.mock.calls.map(([key]) => key).sort()).toEqual(['express-pay', 'new-checkout']);
    expect(checkoutOf(fixture)).toBe('new');
  });

  it('turns a flag off without a reload when the provider reports it changed to disabled', () => {
    const { reader, provider } = setUp(variant);
    reader.setContext({ targetingKey: IN_ROLLOUT });
    const fixture = TestBed.createComponent(Checkout);
    render(fixture);
    expect(checkoutOf(fixture)).toBe('new');

    provider.update('new-checkout', { ...NEW_CHECKOUT, disabled: true });
    render(fixture);
    expect(checkoutOf(fixture)).toBe('classic');
    const details = TestBed.runInInjectionContext(() => reader.details('new-checkout', false));
    expect(details()).toEqual({ value: false, reason: 'DISABLED' });
  });

  it('returns the default value with an error reason and code when the provider throws', () => {
    const { reader, provider } = setUp(variant);
    const unknown = TestBed.runInInjectionContext(() => reader.details('no-such-flag', true));
    expect(unknown()).toEqual({ value: true, reason: 'ERROR', errorCode: 'FLAG_NOT_FOUND' });

    vi.spyOn(provider, 'resolveBoolean').mockImplementation(() => {
      throw new Error('flag backend unreachable');
    });
    const express = TestBed.runInInjectionContext(() => reader.details('express-pay', false));
    expect(express()).toEqual({ value: false, reason: 'ERROR', errorCode: 'GENERAL' });
  });

  it('renders the new checkout only while its flag is on', () => {
    const { reader } = setUp(variant);
    const fixture = TestBed.createComponent(Checkout);
    render(fixture);
    expect(checkoutOf(fixture)).toBe('classic');

    reader.setContext({ targetingKey: IN_ROLLOUT });
    render(fixture);
    expect(checkoutOf(fixture)).toBe('new');

    reader.setContext({ targetingKey: OUT_OF_ROLLOUT });
    render(fixture);
    expect(checkoutOf(fixture)).toBe('classic');
  });
});
