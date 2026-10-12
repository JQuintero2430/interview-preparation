import {
  EnvironmentProviders,
  inject,
  InjectionToken,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
  Service,
} from '@angular/core';

// The strategy: one interface, two adapters, chosen by an option.
export interface PaymentStrategy {
  charge(cents: number): string;
}

export class FakeGateway implements PaymentStrategy {
  charge(cents: number): string {
    return `fake:${cents}`;
  }
}

export class StripeGateway implements PaymentStrategy {
  constructor(private readonly currency: string) {}

  charge(cents: number): string {
    return `stripe:${cents} ${this.currency}`;
  }
}

export interface BillingConfig {
  currency: string;
}

export interface BillingOptions {
  provider: 'fake' | 'stripe';
  currency?: string;
}

// No default: only provideBilling() provides it, so a missing call fails with NG0201.
export const PAYMENT = new InjectionToken<PaymentStrategy>('lab-e4-payment');

// A default in root: nothing has to provide it.
export const BILLING_CONFIG = new InjectionToken<BillingConfig>('lab-e4-config', {
  providedIn: 'root',
  factory: () => ({ currency: 'USD' }),
});

// A multi token: every contributor appends one hook name.
export const BILLING_HOOKS = new InjectionToken<string[]>('lab-e4-hooks');

// Records what the initializer did, so a test can read it.
@Service()
export class BillingLog {
  readonly events: string[] = [];
}

// The library entry point: environment-only, so a component cannot list it by mistake.
export function provideBilling(options: BillingOptions): EnvironmentProviders {
  return makeEnvironmentProviders([
    ...(options.currency
      ? [{ provide: BILLING_CONFIG, useValue: { currency: options.currency } }]
      : []),
    {
      provide: PAYMENT,
      useFactory: (): PaymentStrategy =>
        options.provider === 'stripe'
          ? new StripeGateway(inject(BILLING_CONFIG).currency)
          : new FakeGateway(),
    },
    { provide: BILLING_HOOKS, useValue: 'audit', multi: true },
    provideEnvironmentInitializer(() => {
      inject(BillingLog).events.push('initialized');
    }),
  ]);
}
