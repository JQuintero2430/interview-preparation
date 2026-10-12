import { createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  Alpha,
  AlphaOk,
  Beta,
  BetaOk,
  cleanups,
  FEATURE_NAME,
  Late,
  LATE_PROVIDERS,
  openFeature,
  Shared,
} from './feature-injector';

const NG0205 =
  'NG0205: Injector has already been destroyed. Find more at https://v22.angular.dev/errors/NG0205';

describe('E16.5 A feature injector with cleanup', () => {
  beforeEach(() => {
    cleanups.ngOnDestroy = 0;
    cleanups.callback = 0;
    TestBed.configureTestingModule({ providers: [{ provide: FEATURE_NAME, useValue: 'checkout' }] });
  });

  it('the session reaches a parent token', () => {
    const feature = openFeature(TestBed.inject(EnvironmentInjector));

    expect(feature.session.name).toBe('checkout');
    expect(feature.get(FEATURE_NAME)).toBe('checkout');
  });

  it("close() runs the session's ngOnDestroy and the DestroyRef callback once", () => {
    const feature = openFeature(TestBed.inject(EnvironmentInjector));
    expect(cleanups).toEqual({ ngOnDestroy: 0, callback: 0 });

    feature.close();

    expect(cleanups).toEqual({ ngOnDestroy: 1, callback: 1 });
  });

  it('get after close() is NG0205', () => {
    const feature = openFeature(TestBed.inject(EnvironmentInjector));
    feature.close();

    expect(() => feature.get(FEATURE_NAME)).toThrowError(NG0205);
  });

  it('the cleanup callback can be removed before close()', () => {
    const feature = openFeature(TestBed.inject(EnvironmentInjector));

    feature.session.cancelCallback();
    feature.close();

    expect(cleanups).toEqual({ ngOnDestroy: 1, callback: 0 });
  });

  it('the cycle A -> B -> A throws NG0200, and the extracted third service resolves both', () => {
    const injector = createEnvironmentInjector(
      [Alpha, Beta, Shared, AlphaOk, BetaOk],
      TestBed.inject(EnvironmentInjector),
    );

    expect(() => injector.get(Alpha)).toThrowError(
      /^NG0200: Circular dependency detected for `_?Alpha`\. Path: _?Alpha -> _?Beta -> _?Alpha\. Find more at https:\/\/v22\.angular\.dev\/errors\/NG0200$/,
    );
    expect(injector.get(AlphaOk).shared).toBe(injector.get(BetaOk).shared);
  });

  it('forwardRef lets a provider list name a later-declared class', () => {
    const injector = createEnvironmentInjector(LATE_PROVIDERS, TestBed.inject(EnvironmentInjector));

    expect(injector.get(Late).text).toBe('declared after its use');
  });
});
