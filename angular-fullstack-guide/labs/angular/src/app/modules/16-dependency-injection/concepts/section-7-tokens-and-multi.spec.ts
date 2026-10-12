import {
  createEnvironmentInjector,
  ENVIRONMENT_INITIALIZER,
  EnvironmentInjector,
  EnvironmentProviders,
  inject,
  InjectionToken,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

// A configuration token with a default: nothing has to provide it.
const PAGE_SIZE = new InjectionToken<number>('lab-s7-page-size', {
  providedIn: 'root',
  factory: () => 25,
});

// The same kind of token without a factory: something has to provide it.
const REQUIRED_URL = new InjectionToken<string>('lab-s7-required-url');

// A multi token: every provider appends to one list.
const PLUGINS = new InjectionToken<string[]>('lab-s7-plugins');

// A library-style function: its providers are only meant for environment injectors.
function providePlugins(...names: string[]): EnvironmentProviders {
  return makeEnvironmentProviders(
    names.map((name) => ({ provide: PLUGINS, useValue: name, multi: true })),
  );
}

// Records what an initializer saw, so a test can read it.
const SEEN = new InjectionToken<string[]>('lab-s7-seen', {
  providedIn: 'root',
  factory: () => [],
});

describe('Section 7: tokens, multi providers and environment providers', () => {
  it('Section 7: a token with a factory is provided in root and one without is NG0201', () => {
    expect(TestBed.inject(PAGE_SIZE)).toBe(25);
    expect(TestBed.inject(PAGE_SIZE)).toBe(TestBed.inject(PAGE_SIZE));

    expect(() => TestBed.inject(REQUIRED_URL)).toThrowError(
      'NG0201: No provider found for `InjectionToken lab-s7-required-url`. Find more at https://v22.angular.dev/errors/NG0201',
    );
    expect(TestBed.inject(REQUIRED_URL, null, { optional: true })).toBeNull();

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [{ provide: PAGE_SIZE, useValue: 50 }] });
    expect(TestBed.inject(PAGE_SIZE)).toBe(50);
  });

  it('Section 7: multi providers from separate provider lists collect into one array', () => {
    TestBed.configureTestingModule({
      providers: [
        providePlugins('auth'),
        { provide: PLUGINS, useFactory: () => 'logging', multi: true },
        providePlugins('cache', 'metrics'),
      ],
    });

    expect(TestBed.inject(PLUGINS)).toEqual(['auth', 'logging', 'cache', 'metrics']);
  });

  it("Section 7: a child injector's multi list neither extends nor replaces its parent's", () => {
    TestBed.configureTestingModule({ providers: [providePlugins('root-a', 'root-b')] });
    const parent = TestBed.inject(EnvironmentInjector);
    const child = createEnvironmentInjector([providePlugins('child')], parent);

    expect(child.get(PLUGINS)).toEqual(['child']);
    expect(parent.get(PLUGINS)).toEqual(['root-a', 'root-b']);
    child.destroy();
  });

  it('Section 7: provideEnvironmentInitializer runs once and can inject', () => {
    const parent = TestBed.inject(EnvironmentInjector);
    const seen = parent.get(SEEN);

    const child = createEnvironmentInjector(
      [
        provideEnvironmentInitializer(() => {
          seen.push(`page size ${inject(PAGE_SIZE)}`);
        }),
      ],
      parent,
    );
    expect(seen).toEqual(['page size 25']);

    child.get(PAGE_SIZE);
    child.get(SEEN);
    expect(seen).toEqual(['page size 25']);
    child.destroy();
  });

  it('Section 7: the deprecated ENVIRONMENT_INITIALIZER token runs its function the same way', () => {
    const parent = TestBed.inject(EnvironmentInjector);
    const seen = parent.get(SEEN);

    const child = createEnvironmentInjector(
      [
        {
          provide: ENVIRONMENT_INITIALIZER,
          multi: true,
          useValue: () => seen.push(`legacy ${inject(PAGE_SIZE)}`),
        },
      ],
      parent,
    );

    expect(seen).toEqual(['legacy 25']);
    child.destroy();
  });

  it('Section 7: makeEnvironmentProviders is accepted in an environment injector', () => {
    const wrapped = makeEnvironmentProviders([providePlugins('inner')]);
    TestBed.configureTestingModule({ providers: [wrapped, providePlugins('outer')] });

    expect(TestBed.inject(PLUGINS)).toEqual(['inner', 'outer']);
  });
});
