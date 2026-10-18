import { Component, computed, DestroyRef, inject, PendingTasks, Service, signal } from '@angular/core';
import { getTestBed, TestBed } from '@angular/core/testing';

const TEMPLATE_ERROR = 'LabM29Fragile cannot render';
const ALREADY_INITIALIZED = 'Cannot set base providers because it has already been called';

@Service()
class LabM29DestroyLog {
  readonly entries: string[] = [];
}

@Component({
  selector: 'lab-m29-badge',
  template: '<span>{{ text() }}</span>',
})
class LabM29Badge {
  readonly text = signal('ready');

  constructor() {
    const log = inject(LabM29DestroyLog);
    inject(DestroyRef).onDestroy(() => log.entries.push('badge destroyed'));
  }
}

@Component({
  selector: 'lab-m29-fragile',
  template: '<span>{{ label() }}</span>',
})
class LabM29Fragile {
  readonly broken = signal(false);
  protected readonly label = computed(() => {
    if (this.broken()) {
      throw new Error(TEMPLATE_ERROR);
    }
    return 'fine';
  });
}

describe('Section 12: under the hood', () => {
  it('Section 12: the fixture is stable when no pending task is open', async () => {
    const fixture = TestBed.createComponent(LabM29Badge);
    await fixture.whenStable();
    expect(fixture.isStable()).toBe(true);

    const removeTask = TestBed.inject(PendingTasks).add();
    expect(fixture.isStable()).toBe(false);

    removeTask();
    await fixture.whenStable();
    expect(fixture.isStable()).toBe(true);
  });

  it('Section 12: whenStable resolves true after waiting for a render', async () => {
    const fixture = TestBed.createComponent(LabM29Badge);
    expect(fixture.isStable()).toBe(false);

    expect(await fixture.whenStable()).toBe(true);
    expect(fixture.nativeElement.textContent).toBe('ready');
  });

  it("Section 12: TestBed destroys the test's component after the test ends", () => {
    const log = TestBed.inject(LabM29DestroyLog);
    TestBed.createComponent(LabM29Badge);
    // Runs after every afterEach hook, including the builder's cleanup hook.
    onTestFinished(() => {
      expect(log.entries).toEqual(['badge destroyed']);
    });

    expect(log.entries).toEqual([]);
  });

  it('Section 12: an error during change detection fails the test', async () => {
    const fixture = TestBed.createComponent(LabM29Fragile);
    await fixture.whenStable();

    fixture.componentInstance.broken.set(true);

    await expect(fixture.whenStable()).rejects.toThrow(TEMPLATE_ERROR);
  });

  it('Section 12: the test environment is initialized once, not per test', () => {
    const testBed = getTestBed();
    const platform = testBed.platform;

    TestBed.resetTestingModule();

    expect(testBed.platform).toBe(platform);
    expect(() => testBed.initTestEnvironment([], platform)).toThrow(ALREADY_INITIALIZED);
  });
});
