import { EnvironmentInjector, inject, Service } from '@angular/core';
import { TestBed } from '@angular/core/testing';

@Service()
class LabM29Clock {
  readonly label: string = 'real';
}

@Service()
class LabM29Stamp {
  private readonly clock = inject(LabM29Clock);

  text(): string {
    return `stamp of ${this.clock.label}`;
  }
}

@Service()
class LabM29Counter {
  count = 0;
}

function labM29ReadClock(): string {
  return inject(LabM29Clock).label;
}

const CONFIGURE_AFTER_INJECT =
  'Cannot configure the test module when the test module has already been instantiated. ' +
  'Make sure you are not using `inject` before `TestBed.configureTestingModule`.';
const NOT_IN_CONTEXT_CLOCK =
  /^NG0203: The `_?LabM29Clock` token injection failed\. `inject\(\)` function must be called from an injection context such as a constructor, a factory function, a field initializer, or a function used with `runInInjectionContext`\. Find more at https:\/\/v22\.angular\.dev\/errors\/NG0203$/;

describe('Section 4: TestBed', () => {
  it('Section 4: configureTestingModule after TestBed.inject throws', () => {
    TestBed.inject(EnvironmentInjector);

    expect(() => TestBed.configureTestingModule({})).toThrow(CONFIGURE_AFTER_INJECT);
  });

  it("Section 4: TestBed.inject returns the test's root instance", () => {
    const clock = TestBed.inject(LabM29Clock);

    expect(TestBed.inject(LabM29Clock)).toBe(clock);
    expect(TestBed.inject(EnvironmentInjector).get(LabM29Clock)).toBe(clock);
  });

  it('Section 4: runInInjectionContext runs a function that calls inject', () => {
    expect(TestBed.runInInjectionContext(labM29ReadClock)).toBe('real');
  });

  it('Section 4: a function that calls inject outside a context throws NG0203', () => {
    expect(() => labM29ReadClock()).toThrowError(NOT_IN_CONTEXT_CLOCK);
  });

  it('Section 4: overrideProvider replaces a dependency of a root service', () => {
    TestBed.overrideProvider(LabM29Clock, { useValue: { label: 'fake' } });

    expect(TestBed.inject(LabM29Stamp).text()).toBe('stamp of fake');
  });

  it('Section 4: each test gets a new root instance', () => {
    const first = TestBed.inject(LabM29Counter);
    first.count++;

    // What the builder's cleanup hook calls after every test.
    TestBed.resetTestingModule();
    const next = TestBed.inject(LabM29Counter);

    expect(next).not.toBe(first);
    expect(next.count).toBe(0);
  });
});
