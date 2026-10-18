/// <reference types="@angular/localize" />

import { DEFAULT_CURRENCY_CODE, LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';

// Section 1 claims: LOCALE_ID's factory falls back from a provider to `$localize.locale` to 'en-US',
// and DEFAULT_CURRENCY_CODE does not follow the locale. `ng test` loads `@angular/localize/init`
// itself, so `$localize` exists; each test restores `$localize.locale`.
describe('Section 1: LOCALE_ID', () => {
  let savedLocale: string | undefined;

  beforeEach(() => {
    savedLocale = $localize.locale;
  });

  afterEach(() => {
    $localize.locale = savedLocale;
  });

  it('Section 1: LOCALE_ID is en-US when nothing sets it', () => {
    $localize.locale = undefined;

    expect(TestBed.inject(LOCALE_ID)).toBe('en-US');
  });

  it('Section 1: LOCALE_ID follows $localize.locale when no provider sets it', () => {
    // Set before the first inject: the root injector runs the token's factory once and caches the value.
    $localize.locale = 'fr';

    expect(TestBed.inject(LOCALE_ID)).toBe('fr');
  });

  it('Section 1: a LOCALE_ID provider wins over $localize.locale', () => {
    $localize.locale = 'fr';
    TestBed.configureTestingModule({ providers: [{ provide: LOCALE_ID, useValue: 'de' }] });

    expect(TestBed.inject(LOCALE_ID)).toBe('de');
  });

  it('Section 1: DEFAULT_CURRENCY_CODE is USD in a French app', () => {
    TestBed.configureTestingModule({ providers: [{ provide: LOCALE_ID, useValue: 'fr' }] });

    expect(TestBed.inject(LOCALE_ID)).toBe('fr');
    expect(TestBed.inject(DEFAULT_CURRENCY_CODE)).toBe('USD');
  });
});
