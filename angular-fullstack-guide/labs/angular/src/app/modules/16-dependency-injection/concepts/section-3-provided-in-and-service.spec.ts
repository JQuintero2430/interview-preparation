import { Component, inject, Injectable, Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  built,
  Greeter,
  LegacyShopping,
  OptIn,
  PlatformStamp,
  SALUTATION,
  Shopping,
} from './service-demo';

// A component that lists a root service again, so it gets its own instance.
@Component({ selector: 'lab-s3-own', template: '', providers: [Shopping] })
class OwnShopping {
  readonly shopping = inject(Shopping);
}

@Component({ selector: 'lab-s3-reads', template: '' })
class ReadsShopping {
  readonly shopping = inject(Shopping);
}

// A component that lists the opt-in service.
@Component({ selector: 'lab-s3-lists-opt-in', template: '', providers: [OptIn] })
class ListsOptIn {
  readonly optIn = inject(OptIn);
}

// A class with `@Injectable()` and no `providedIn` is not registered anywhere.
@Injectable()
class Unscoped {}

describe('Section 3: providedIn and @Service', () => {
  beforeEach(() => {
    built.shopping = 0;
    built.legacy = 0;
    built.optIn = 0;
    built.greeter = 0;
    built.stamp = 0;
  });

  it('Section 3: a root service and a @Service class are singletons', () => {
    expect(TestBed.inject(Shopping)).toBe(TestBed.inject(Shopping));
    expect(TestBed.inject(LegacyShopping)).toBe(TestBed.inject(LegacyShopping));
    expect(TestBed.createComponent(ReadsShopping).componentInstance.shopping).toBe(
      TestBed.inject(Shopping),
    );
    expect(built.shopping).toBe(1);
    expect(built.legacy).toBe(1);
  });

  it('Section 3: nothing is constructed before the first lookup', () => {
    TestBed.inject(Injector);
    expect(built.shopping).toBe(0);
    expect(built.legacy).toBe(0);
  });

  it('Section 3: an @Injectable without providedIn is not found', () => {
    expect(() => TestBed.inject(Unscoped)).toThrowError(
      /NG0201: No provider found for `_?Unscoped`/,
    );
  });

  it('Section 3: autoProvided false is not found until listed in providers', () => {
    expect(() => TestBed.inject(OptIn)).toThrowError(/NG0201: No provider found for `_?OptIn`/);
    expect(built.optIn).toBe(0);

    const listed = TestBed.createComponent(ListsOptIn).componentInstance.optIn;
    expect(listed).toBeInstanceOf(OptIn);
    expect(built.optIn).toBe(1);
  });

  it('Section 3: a @Service factory replaces construction and can inject', () => {
    expect(TestBed.inject(Greeter).greet()).toBe('hello');
    expect(built.greeter).toBe(1);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [{ provide: SALUTATION, useValue: 'hi' }] });
    expect(TestBed.inject(Greeter).greet()).toBe('hi');
  });

  it('Section 3: a component-level provider shadows the root instance', () => {
    const root = TestBed.inject(Shopping);
    const own = TestBed.createComponent(OwnShopping).componentInstance.shopping;
    const shared = TestBed.createComponent(ReadsShopping).componentInstance.shopping;

    expect(own).not.toBe(root);
    expect(shared).toBe(root);
    expect(built.shopping).toBe(2);
  });

  it('Section 3: a platform service is visible from the root injector and a root service is not visible from the platform injector', () => {
    const platform = TestBed.platform.injector;

    expect(TestBed.inject(PlatformStamp)).toBe(platform.get(PlatformStamp));
    expect(() => platform.get(Shopping)).toThrowError(
      /NG0201: No provider found for `_?Shopping`\. Source: Platform: core\./,
    );
  });
});
