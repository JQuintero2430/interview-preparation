import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { inject, InjectionToken, PLATFORM_ID, REQUEST, RESPONSE_INIT } from '@angular/core';
import { TestBed } from '@angular/core/testing';

/** A preference store with one implementation per platform. */
interface Preferences {
  readonly kind: 'browser' | 'server';
}

const PREFERENCES = new InjectionToken<Preferences>('lab-m32 preferences', {
  factory: () => ({ kind: isPlatformBrowser(inject(PLATFORM_ID)) ? 'browser' : 'server' }),
});

describe('Section 7: platform-specific code', () => {
  it('Section 7: isPlatformBrowser is false under the server platform id', () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });

    const platformId = TestBed.inject(PLATFORM_ID);

    expect(isPlatformBrowser(platformId)).toBe(false);
    expect(isPlatformServer(platformId)).toBe(true);
  });

  it('Section 7: a factory provider picks the server implementation from PLATFORM_ID', () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });

    expect(TestBed.inject(PREFERENCES).kind).toBe('server');
  });

  it('Section 7: REQUEST and RESPONSE_INIT are null outside a server render', () => {
    expect(TestBed.inject(REQUEST)).toBeNull();
    expect(TestBed.inject(RESPONSE_INIT)).toBeNull();
  });
});
