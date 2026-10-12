import { Component, inject, Injectable, InjectionToken, Provider } from '@angular/core';
import { TestBed } from '@angular/core/testing';

// Counts constructor and factory calls so a test asserts how many instances were made.
const calls = { logger: 0, basket: 0, api: 0 };

// A token that is an abstract class, and one implementation behind it.
abstract class Logger {
  abstract log(message: string): string;
}

abstract class AuditLogger {
  abstract log(message: string): string;
}

@Injectable()
class ConsoleLogger extends Logger {
  constructor() {
    super();
    calls.logger++;
  }

  log(message: string): string {
    return `console: ${message}`;
  }
}

// The same class registered through the shorthand and through the long form.
@Injectable()
class Basket {
  constructor() {
    calls.basket++;
  }
}

@Component({ selector: 'lab-s2-short', template: '', providers: [Basket] })
class ShortForm {
  readonly basket = inject(Basket);
}

@Component({
  selector: 'lab-s2-long',
  template: '',
  providers: [{ provide: Basket, useClass: Basket }],
})
class LongForm {
  readonly basket = inject(Basket);
}

// A configuration object, a token for it, and a consumer.
interface Settings {
  url: string;
}

const SETTINGS = new InjectionToken<Settings>('lab-s2-settings');
const WRONG_TYPE = new InjectionToken<Settings>('lab-s2-wrong-type');

@Component({ selector: 'lab-s2-reads-settings', template: '' })
class ReadsSettings {
  readonly settings = inject(SETTINGS);
}

// A factory that reads another token, used at root and in a component's own providers.
const BASE_URL = new InjectionToken<string>('lab-s2-base-url');

class ApiClient {
  constructor(readonly baseUrl: string) {
    calls.api++;
  }
}

const apiProvider: Provider = {
  provide: ApiClient,
  useFactory: () => new ApiClient(inject(BASE_URL)),
};

@Component({ selector: 'lab-s2-api-root', template: '' })
class UsesRootApi {
  readonly api = inject(ApiClient);
}

@Component({ selector: 'lab-s2-api-own', template: '', providers: [apiProvider] })
class UsesOwnApi {
  readonly api = inject(ApiClient);
}

// Tokens for the last-wins, multi and missing-provider tests.
const ENDPOINT = new InjectionToken<string>('lab-s2-endpoint');
const MISSING = new InjectionToken<string>('lab-s2-missing');
const TARGET = new InjectionToken<string>('lab-s2-target');

abstract class AliasOfTarget {}

@Component({ selector: 'lab-s2-needs-missing', template: '' })
class NeedsMissing {
  readonly value = inject(MISSING);
}

describe('Section 2: providers and tokens', () => {
  beforeEach(() => {
    calls.logger = 0;
    calls.basket = 0;
    calls.api = 0;
    TestBed.configureTestingModule({});
  });

  it('Section 2: a class shorthand equals useClass of itself', () => {
    const short = TestBed.createComponent(ShortForm).componentInstance;
    const long = TestBed.createComponent(LongForm).componentInstance;

    expect(short.basket.constructor).toBe(Basket);
    expect(long.basket.constructor).toBe(Basket);
    expect(short.basket).not.toBe(long.basket);
    expect(calls.basket).toBe(2);
    expect(() => TestBed.inject(Basket)).toThrowError(/NG0201: No provider found/);
  });

  it('Section 2: useClass creates its own instance while useExisting returns the target instance', () => {
    TestBed.configureTestingModule({
      providers: [
        ConsoleLogger,
        { provide: Logger, useExisting: ConsoleLogger },
        { provide: AuditLogger, useClass: ConsoleLogger },
      ],
    });

    const target = TestBed.inject(ConsoleLogger);
    expect(TestBed.inject(Logger)).toBe(target);
    expect(TestBed.inject(AuditLogger)).not.toBe(target);
    expect(TestBed.inject(AuditLogger)).toBeInstanceOf(ConsoleLogger);
    expect(TestBed.inject(AuditLogger)).toBe(TestBed.inject(AuditLogger));
    expect(calls.logger).toBe(2);
    expect(TestBed.inject(Logger).log('hi')).toBe('console: hi');
  });

  it('Section 2: useValue returns the same object every time', () => {
    const settings: Settings = { url: 'https://api.example' };
    TestBed.configureTestingModule({ providers: [{ provide: SETTINGS, useValue: settings }] });

    const first = TestBed.createComponent(ReadsSettings).componentInstance;
    const second = TestBed.createComponent(ReadsSettings).componentInstance;

    expect(first.settings).toBe(settings);
    expect(second.settings).toBe(settings);
    settings.url = 'https://changed.example';
    expect(TestBed.inject(SETTINGS).url).toBe('https://changed.example');
  });

  it('Section 2: useValue is not checked against the token type', () => {
    TestBed.configureTestingModule({ providers: [{ provide: WRONG_TYPE, useValue: 42 }] });

    const value: unknown = TestBed.inject(WRONG_TYPE);
    expect(value).toBe(42);
  });

  it('Section 2: useFactory runs once per injector and can inject', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: BASE_URL, useValue: 'https://api.example' }, apiProvider],
    });
    expect(calls.api).toBe(0);

    const root = TestBed.inject(ApiClient);
    expect(TestBed.inject(ApiClient)).toBe(root);
    expect(root.baseUrl).toBe('https://api.example');
    expect(calls.api).toBe(1);

    const viaRoot = TestBed.createComponent(UsesRootApi).componentInstance;
    expect(viaRoot.api).toBe(root);
    expect(calls.api).toBe(1);

    const firstOwn = TestBed.createComponent(UsesOwnApi).componentInstance;
    const secondOwn = TestBed.createComponent(UsesOwnApi).componentInstance;
    expect(firstOwn.api).not.toBe(root);
    expect(secondOwn.api).not.toBe(firstOwn.api);
    expect(calls.api).toBe(3);
  });

  it('Section 2: useFactory deps pass the resolved tokens to the factory', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: BASE_URL, useValue: 'https://deps.example' },
        {
          provide: ApiClient,
          useFactory: (baseUrl: string) => new ApiClient(baseUrl),
          deps: [BASE_URL],
        },
      ],
    });

    expect(TestBed.inject(ApiClient).baseUrl).toBe('https://deps.example');
    expect(calls.api).toBe(1);
  });

  it('Section 2: the last provider for a token wins', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: ENDPOINT, useValue: 'first' },
        { provide: ENDPOINT, useFactory: () => 'second' },
        { provide: ENDPOINT, useValue: 'third' },
      ],
    });

    expect(TestBed.inject(ENDPOINT)).toBe('third');
  });

  it('Section 2: two multi providers for a token return both values in order', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: ENDPOINT, useValue: 'a', multi: true },
        { provide: ENDPOINT, useValue: 'b', multi: true },
      ],
    });

    expect(TestBed.inject(ENDPOINT)).toEqual(['a', 'b']);
  });

  it('Section 2: a multi provider mixed with a regular one throws', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: ENDPOINT, useValue: 'a', multi: true },
        { provide: ENDPOINT, useValue: 'b' },
      ],
    });
    expect(() => TestBed.inject(ENDPOINT)).toThrowError(
      'Cannot mix multi providers and regular providers',
    );

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: ENDPOINT, useValue: 'a' },
        { provide: ENDPOINT, useValue: 'b', multi: true },
      ],
    });
    expect(() => TestBed.inject(ENDPOINT)).toThrowError(
      'Cannot mix multi providers and regular providers',
    );
  });

  it('Section 2: a missing provider is NG0201 with the source named', () => {
    expect(() => TestBed.inject(MISSING)).toThrowError(
      'NG0201: No provider found for `InjectionToken lab-s2-missing`. Find more at https://v22.angular.dev/errors/NG0201',
    );
    expect(() => TestBed.createComponent(NeedsMissing)).toThrowError(
      'NG0201: No provider found for `InjectionToken lab-s2-missing`. Source: DynamicTestModule. Find more at https://v22.angular.dev/errors/NG0201',
    );
  });

  it('Section 2: useExisting to an unprovided token fails naming the target', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: AliasOfTarget, useExisting: TARGET }],
    });

    expect(() => TestBed.inject(AliasOfTarget)).toThrowError(
      /NG0201: No provider found for `InjectionToken lab-s2-target`/,
    );
  });
});
