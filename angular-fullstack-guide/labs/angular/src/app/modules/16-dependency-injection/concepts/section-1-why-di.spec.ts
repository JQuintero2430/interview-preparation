import {
  Component,
  inject,
  Inject,
  Injectable,
  InjectionToken,
  Optional,
  Service,
  signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

// One service whose state shows whether two consumers share an instance.
@Service()
class Cart {
  readonly count = signal(0);
}

@Component({ selector: 'lab-s1-first', template: '' })
class First {
  readonly cart = inject(Cart);
}

@Component({ selector: 'lab-s1-second', template: '' })
class Second {
  readonly cart = inject(Cart);
}

@Component({ selector: 'lab-s1-own', template: '', providers: [Cart] })
class Own {
  readonly cart = inject(Cart);
}

@Component({ selector: 'lab-s1-ctor', template: '' })
class FromConstructor {
  constructor(readonly cart: Cart) {}
}

// A consumer that declares a token and never builds its collaborator.
abstract class Clock {
  abstract now(): number;
}

class SystemClock extends Clock {
  now(): number {
    return Date.now();
  }
}

@Service()
class Report {
  private readonly clock = inject(Clock);

  stamp(): string {
    return `generated at ${this.clock.now()}`;
  }
}

// Tokens that are not plain classes.
const GREETING = new InjectionToken<string>('lab-s1-greeting');
const MISSING = new InjectionToken<string>('lab-s1-missing');

// A class with a constructor parameter and no decorator, and one with no provider.
class Undecorated {
  constructor(readonly cart: Cart) {}
}

@Injectable()
class NoProvider {}

@Component({ selector: 'lab-s1-base', template: '' })
class Base {
  readonly cart = inject(Cart);
}

@Component({ selector: 'lab-s1-sub', template: '' })
class Sub extends Base {}

@Component({ selector: 'lab-s1-legacy', template: '' })
class LegacyParams {
  constructor(
    @Inject(GREETING) readonly greeting: string,
    @Optional() @Inject(MISSING) readonly missing: string | null,
  ) {}
}

describe('Section 1: why dependency injection', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('Section 1: a root service is one instance across consumers', () => {
    const first = TestBed.createComponent(First).componentInstance;
    const second = TestBed.createComponent(Second).componentInstance;

    expect(first.cart).toBe(second.cart);
    expect(first.cart).toBe(TestBed.inject(Cart));
    first.cart.count.set(5);
    expect(second.cart.count()).toBe(5);
  });

  it('Section 1: a component-level provider gives its own instance', () => {
    const own = TestBed.createComponent(Own).componentInstance;
    const shared = TestBed.createComponent(First).componentInstance;

    expect(own.cart).not.toBe(shared.cart);
    own.cart.count.set(7);
    expect(shared.cart.count()).toBe(0);
  });

  it('Section 1: a field inject() and a constructor parameter resolve one instance', () => {
    const viaField = TestBed.createComponent(First).componentInstance;
    const viaConstructor = TestBed.createComponent(FromConstructor).componentInstance;

    expect(viaConstructor.cart).toBe(viaField.cart);
  });

  it('Section 1: a subclass inherits an inject() field', () => {
    expect(TestBed.createComponent(Sub).componentInstance.cart).toBe(TestBed.inject(Cart));
  });

  it('Section 1: @Inject and @Optional parameters resolve', () => {
    TestBed.configureTestingModule({ providers: [{ provide: GREETING, useValue: 'hello' }] });
    const legacy = TestBed.createComponent(LegacyParams).componentInstance;

    expect(legacy.greeting).toBe('hello');
    expect(legacy.missing).toBeNull();
  });

  it('Section 1: providers replace a dependency and the consumer is unchanged', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: Clock, useValue: { now: () => 42 } }],
    });
    expect(TestBed.inject(Report).stamp()).toBe('generated at 42');
  });

  it('Section 1: a class, an abstract class and an InjectionToken are tokens', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Clock, useClass: SystemClock },
        { provide: GREETING, useValue: 'hi' },
      ],
    });

    expect(TestBed.inject(Cart)).toBeInstanceOf(Cart);
    expect(TestBed.inject(Clock)).toBeInstanceOf(SystemClock);
    expect(TestBed.inject(GREETING)).toBe('hi');
  });

  it('Section 1: an unprovided class or token fails with NG0201 naming it', () => {
    expect(() => TestBed.inject(NoProvider)).toThrowError(
      /NG0201: No provider found for `_?NoProvider`/,
    );
    expect(() => TestBed.inject(GREETING)).toThrowError(
      /NG0201: No provider found for `InjectionToken lab-s1-greeting`/,
    );
  });

  it('Section 1: an undecorated class with a constructor parameter has no provider', () => {
    expect(() => TestBed.inject(Undecorated)).toThrowError(
      /NG0201: No provider found for `_?Undecorated`/,
    );
  });
});
