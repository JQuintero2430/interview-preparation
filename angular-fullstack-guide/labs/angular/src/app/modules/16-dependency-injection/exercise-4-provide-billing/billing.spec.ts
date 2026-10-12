import { Component, createEnvironmentInjector, EnvironmentInjector, Provider } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  BILLING_CONFIG,
  BILLING_HOOKS,
  BillingLog,
  PAYMENT,
  PaymentStrategy,
  provideBilling,
} from './billing';

// The cast is the only way past TS2322; it then fails at creation with NG0207.
@Component({
  selector: 'lab-e4-bad',
  template: '',
  providers: [provideBilling({ provider: 'fake' }) as unknown as Provider],
})
class Bad {}

describe('E16.4 A provideBilling() library API with tokens', () => {
  it("provideBilling is accepted by TestBed as environment providers and refused in a component's providers with NG0207 through a cast", () => {
    TestBed.configureTestingModule({ providers: [provideBilling({ provider: 'fake' })] });
    expect(TestBed.inject(PAYMENT).charge(500)).toBe('fake:500');

    expect(() => TestBed.createComponent(Bad)).toThrowError(
      /^NG0207: Invalid providers present in a non-environment injector\. 'EnvironmentProviders' can't be used for component providers\./,
    );
  });

  it('the PAYMENT token resolves to the fake or the stripe adapter by option', () => {
    TestBed.configureTestingModule({ providers: [provideBilling({ provider: 'fake' })] });
    expect(TestBed.inject(PAYMENT).charge(500)).toBe('fake:500');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideBilling({ provider: 'stripe', currency: 'EUR' })],
    });
    expect(TestBed.inject(PAYMENT).charge(500)).toBe('stripe:500 EUR');
  });

  it('the BILLING_CONFIG token has a default without the provider', () => {
    expect(TestBed.inject(BILLING_CONFIG)).toEqual({ currency: 'USD' });

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideBilling({ provider: 'fake', currency: 'EUR' })],
    });
    expect(TestBed.inject(BILLING_CONFIG)).toEqual({ currency: 'EUR' });
  });

  it('the BILLING_HOOKS list collects from two contributors in order', () => {
    TestBed.configureTestingModule({
      providers: [
        provideBilling({ provider: 'fake' }),
        { provide: BILLING_HOOKS, useValue: 'metrics', multi: true },
      ],
    });
    expect(TestBed.inject(BILLING_HOOKS)).toEqual(['audit', 'metrics']);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: BILLING_HOOKS, useValue: 'metrics', multi: true },
        provideBilling({ provider: 'fake' }),
      ],
    });
    expect(TestBed.inject(BILLING_HOOKS)).toEqual(['metrics', 'audit']);
  });

  it('the environment initializer ran once, before the first get', () => {
    const parent = TestBed.inject(EnvironmentInjector);
    const log = parent.get(BillingLog);

    const child = createEnvironmentInjector([provideBilling({ provider: 'fake' })], parent);
    expect(log.events).toEqual(['initialized']);

    child.get(PAYMENT);
    child.get(PAYMENT);
    child.get(BILLING_HOOKS);
    expect(log.events).toEqual(['initialized']);
    child.destroy();
  });

  it('a test overrides PAYMENT with a useValue double', () => {
    const double: PaymentStrategy = { charge: (cents) => `double:${cents}` };
    TestBed.configureTestingModule({ providers: [provideBilling({ provider: 'stripe' })] });
    TestBed.overrideProvider(PAYMENT, { useValue: double });

    expect(TestBed.inject(PAYMENT)).toBe(double);
    expect(TestBed.inject(PAYMENT).charge(500)).toBe('double:500');
  });
});
