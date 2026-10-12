import {
  Component,
  createEnvironmentInjector,
  EnvironmentInjector,
  EnvironmentProviders,
  inject,
  Injectable,
  InjectionToken,
  makeEnvironmentProviders,
  Service,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

// A strategy: consumers ask for the token, the injector decides the implementation.
interface PaymentGateway {
  charge(cents: number): string;
}

const PAYMENT = new InjectionToken<PaymentGateway>('lab-s9-payment');

@Injectable()
class StripeGateway implements PaymentGateway {
  charge(cents: number): string {
    return `stripe:${cents}`;
  }
}

@Injectable()
class FakeGateway implements PaymentGateway {
  charge(cents: number): string {
    return `fake:${cents}`;
  }
}

// A configuration token with a default, set by a provide function.
interface BillingConfig {
  readonly currency: string;
}

const BILLING_CONFIG = new InjectionToken<BillingConfig>('lab-s9-billing-config', {
  providedIn: 'root',
  factory: () => ({ currency: 'USD' }),
});

function provideBilling(config: Partial<BillingConfig> = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: BILLING_CONFIG, useValue: { currency: 'USD', ...config } },
  ]);
}

@Service()
class Invoicer {
  private readonly config = inject(BILLING_CONFIG);

  label(cents: number): string {
    return `${cents} ${this.config.currency}`;
  }
}

// A facade: consumers call one method, the class injects the services behind it.
@Service({ autoProvided: false })
class Billing {
  private readonly payment = inject(PAYMENT);
  private readonly invoicer = inject(Invoicer);

  pay(cents: number): string {
    return `${this.payment.charge(cents)} ${this.invoicer.label(cents)}`;
  }
}

// A feature flag: a token whose factory reads another token.
interface Flags {
  readonly newCheckout: boolean;
}

const FLAGS = new InjectionToken<Flags>('lab-s9-flags', {
  providedIn: 'root',
  factory: () => ({ newCheckout: false }),
});

const CHECKOUT = new InjectionToken<string>('lab-s9-checkout', {
  providedIn: 'root',
  factory: () => (inject(FLAGS).newCheckout ? 'new checkout' : 'old checkout'),
});

// A root service and a component that lists the same class in its own providers.
@Service()
class Greeter {
  greet(): string {
    return 'real';
  }
}

@Component({
  selector: 'lab-s9-local',
  providers: [Greeter],
  template: '{{ text }}',
})
class LocalGreeting {
  protected readonly text = inject(Greeter).greet();
}

const fakeGreeter = { greet: () => 'fake' };

describe('Section 9: DI patterns, testing and the Spring container', () => {
  it('Section 9: a token resolves to a different strategy per injector', () => {
    const root = TestBed.inject(EnvironmentInjector);
    const live = createEnvironmentInjector(
      [{ provide: PAYMENT, useClass: StripeGateway }, Billing],
      root,
    );
    const test = createEnvironmentInjector(
      [{ provide: PAYMENT, useClass: FakeGateway }, Billing],
      root,
    );

    expect(live.get(Billing).pay(500)).toBe('stripe:500 500 USD');
    expect(test.get(Billing).pay(500)).toBe('fake:500 500 USD');
  });

  it('Section 9: a provide function returns environment providers that configure a service', () => {
    expect(TestBed.inject(Invoicer).label(5)).toBe('5 USD');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideBilling({ currency: 'EUR' })] });

    expect(TestBed.inject(Invoicer).label(5)).toBe('5 EUR');
  });

  it('Section 9: a feature-flag token chooses an implementation through a factory', () => {
    expect(TestBed.inject(CHECKOUT)).toBe('old checkout');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: FLAGS, useValue: { newCheckout: true } }],
    });

    expect(TestBed.inject(CHECKOUT)).toBe('new checkout');
  });

  it('Section 9: module-level providers replace a root service but not a component-level one', () => {
    TestBed.configureTestingModule({ providers: [{ provide: Greeter, useValue: fakeGreeter }] });

    const fixture = TestBed.createComponent(LocalGreeting);
    fixture.detectChanges();

    expect(TestBed.inject(Greeter).greet()).toBe('fake');
    expect(fixture.nativeElement.textContent).toBe('real');
  });

  it('Section 9: overrideProvider replaces a root service but not a component-level one', () => {
    TestBed.overrideProvider(Greeter, { useValue: fakeGreeter });

    const fixture = TestBed.createComponent(LocalGreeting);
    fixture.detectChanges();

    expect(TestBed.inject(Greeter).greet()).toBe('fake');
    expect(fixture.nativeElement.textContent).toBe('real');
  });

  it('Section 9: overrideComponent replaces a component-level provider', () => {
    TestBed.overrideComponent(LocalGreeting, {
      set: { providers: [{ provide: Greeter, useValue: fakeGreeter }] },
    });

    const fixture = TestBed.createComponent(LocalGreeting);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('fake');
  });

  it('Section 9: TestBed.runInInjectionContext lets a test call inject()', () => {
    const greeting = TestBed.runInInjectionContext(() => inject(Greeter).greet());

    expect(greeting).toBe('real');
  });
});
