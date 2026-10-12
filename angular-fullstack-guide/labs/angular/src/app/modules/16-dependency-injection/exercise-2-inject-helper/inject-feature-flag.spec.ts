import { Component, inject, Injector, OnInit, signal, type Signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FEATURE_FLAGS, injectFeatureFlag, readFlagLater } from './inject-feature-flag';

@Component({ selector: 'lab-e2-in-field', template: '' })
class InField {
  readonly beta = injectFeatureFlag('beta');
}

@Component({ selector: 'lab-e2-in-constructor', template: '' })
class InConstructor {
  readonly beta: Signal<boolean>;

  constructor() {
    this.beta = injectFeatureFlag('beta');
  }
}

// ngOnInit is not an injection context: the helper is called here to show it failing.
@Component({ selector: 'lab-e2-in-hook', template: '' })
class InHook implements OnInit {
  failure = '';

  ngOnInit(): void {
    try {
      injectFeatureFlag('beta');
    } catch (error) {
      this.failure = (error as Error).message;
    }
  }
}

describe('E16.2 An injectX() helper with a clear error', () => {
  const flags = signal<Record<string, boolean>>({ beta: true });

  beforeEach(() => {
    flags.set({ beta: true });
    TestBed.configureTestingModule({ providers: [{ provide: FEATURE_FLAGS, useValue: flags }] });
  });

  it('injectFeatureFlag works in a field initializer and in a constructor', () => {
    expect(TestBed.createComponent(InField).componentInstance.beta()).toBe(true);
    expect(TestBed.createComponent(InConstructor).componentInstance.beta()).toBe(true);
  });

  it('outside an injection context it throws an error naming injectFeatureFlag', () => {
    expect(() => injectFeatureFlag('beta')).toThrowError(/^NG0203: injectFeatureFlag\(\) /);
  });

  it('readFlagLater works with a captured Injector', () => {
    expect(readFlagLater(TestBed.inject(Injector), 'beta')).toBe(true);
    expect(readFlagLater(TestBed.inject(Injector), 'gamma')).toBe(false);
  });

  it('a TestBed.runInInjectionContext test reads a flag from a test token', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: FEATURE_FLAGS, useValue: signal({ beta: false, gamma: true }) }],
    });

    const read = TestBed.runInInjectionContext(() => ({
      beta: injectFeatureFlag('beta')(),
      gamma: injectFeatureFlag('gamma')(),
    }));

    expect(read).toEqual({ beta: false, gamma: true });
  });

  it('use in ngOnInit throws NG0203 as the documented failing case', () => {
    const fixture = TestBed.createComponent(InHook);
    fixture.detectChanges();

    expect(fixture.componentInstance.failure).toMatch(/^NG0203: injectFeatureFlag\(\) /);
  });

  it('the computed updates when the flags signal changes', () => {
    const beta = TestBed.createComponent(InField).componentInstance.beta;

    expect(beta()).toBe(true);
    flags.set({ beta: false });
    expect(beta()).toBe(false);
  });
});
