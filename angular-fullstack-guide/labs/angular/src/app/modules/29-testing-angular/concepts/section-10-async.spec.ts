import { Component, signal } from '@angular/core';
import { fakeAsync, TestBed, waitForAsync } from '@angular/core/testing';
import { SearchApi } from '../exercise-4-fake-timers/search-api';
import { LabM29SearchBox } from '../exercise-4-fake-timers/search-box';

@Component({
  selector: 'lab-m29-slow-message',
  template: '{{ message() }}',
})
class LabM29SlowMessage {
  protected readonly message = signal('wait');

  constructor() {
    setTimeout(() => this.message.set('done'), 1000);
  }
}

// Q29.31's setup: Exercise 29.4's search box, typed into with no TestBed.tick().
function typeWithoutTick(text: string): {
  search: SearchApi['search'];
  results(): string[];
} {
  const search = vi.fn<SearchApi['search']>((term) => Promise.resolve([`${term} one`]));
  TestBed.configureTestingModule({ providers: [{ provide: SearchApi, useValue: { search } }] });
  const root: HTMLElement = TestBed.createComponent(LabM29SearchBox).nativeElement;
  const input = root.querySelector('input');
  if (input === null) {
    throw new Error('no input rendered');
  }
  input.value = text;
  input.dispatchEvent(new Event('input'));
  return {
    search,
    results: () => Array.from(root.querySelectorAll('li')).map((item) => item.textContent ?? ''),
  };
}

const restoreTimers = (): void => {
  vi.useRealTimers();
};

const FAKE_ASYNC_MISSING =
  'zone-testing.js is needed for the fakeAsync() test helper but could not be found.\n' +
  `${' '.repeat(8)}Please make sure that your environment includes zone.js/testing`;
const WAIT_FOR_ASYNC_MISSING =
  'Zone is needed for the waitForAsync() test helper but could not be found. ' +
  'Please make sure that your environment includes zone.js';

describe('Section 10: async tests', () => {
  afterEach(restoreTimers);

  it('Section 10: whenStable waits while fake timers are frozen', async () => {
    vi.useFakeTimers();
    const fixture = TestBed.createComponent(LabM29SlowMessage);
    let resolved = false;
    const stable = fixture.whenStable().then(() => {
      resolved = true;
    });

    for (let turn = 0; turn < 5; turn++) {
      await Promise.resolve();
    }

    expect(resolved).toBe(false);
    expect(fixture.isStable()).toBe(false);
    expect(fixture.nativeElement.textContent).toBe('');

    await vi.advanceTimersByTimeAsync(20);
    await stable;

    expect(resolved).toBe(true);
    expect(fixture.nativeElement.textContent).toBe('wait');
  });

  it("Section 10: advancing the fake clock runs the component's timer", async () => {
    vi.useFakeTimers();
    const fixture = TestBed.createComponent(LabM29SlowMessage);

    await vi.advanceTimersByTimeAsync(20);
    expect(fixture.nativeElement.textContent).toBe('wait');

    await vi.advanceTimersByTimeAsync(1000);
    expect(fixture.nativeElement.textContent).toBe('done');

    TestBed.tick();
    expect(fixture.nativeElement.textContent).toBe('done');
  });

  it('Section 10: shouldAdvanceTime lets whenStable resolve', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true, advanceTimeDelta: 1 });
    const fixture = TestBed.createComponent(LabM29SlowMessage);

    await fixture.whenStable();

    expect(vi.isFakeTimers()).toBe(true);
    expect(fixture.nativeElement.textContent).toBe('wait');
  });

  it('Section 10: fakeAsync throws without zone.js testing', () => {
    expect(typeof Reflect.get(globalThis, 'Zone')).toBe('undefined');

    expect(() => fakeAsync(() => {})()).toThrow(FAKE_ASYNC_MISSING);
  });

  it('Section 10: waitForAsync rejects without zone.js', async () => {
    // The typings declare one parameter (done: any), so the call passes undefined.
    const reason: unknown = await waitForAsync(() => {})(undefined).then(
      () => 'resolved',
      (error: unknown) => error,
    );

    expect(reason).toBe(WAIT_FOR_ASYNC_MISSING);
  });

  it('Section 10: a native async test awaits a promise', async () => {
    const load = (): Promise<string> =>
      new Promise((resolve) => setTimeout(() => resolve('loaded'), 0));

    expect(await load()).toBe('loaded');
  });

  it('Section 10: fake timers are restored after each test', () => {
    const nativeSetTimeout = setTimeout;
    // Vitest runs onTestFinished after every afterEach hook, so this observes the hook itself.
    onTestFinished(() => {
      expect(vi.isFakeTimers()).toBe(false);
      expect(setTimeout).toBe(nativeSetTimeout);
    });

    vi.useFakeTimers();
    expect(vi.isFakeTimers()).toBe(true);
    expect(setTimeout).not.toBe(nativeSetTimeout);
  });

  it('Section 10: the first advance starts the debounce without TestBed.tick', () => {
    vi.useFakeTimers();
    const { search } = typeWithoutTick('ang');

    vi.advanceTimersByTime(299);
    expect(search).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(search).toHaveBeenCalledTimes(1);
    expect(search).toHaveBeenCalledWith('ang');
  });

  it('Section 10: a plain advance runs the search but not its rendered result', async () => {
    vi.useFakeTimers();
    const plain = typeWithoutTick('ang');

    vi.advanceTimersByTime(300);
    expect(plain.search).toHaveBeenCalledWith('ang');
    expect(plain.results()).toEqual([]);

    vi.advanceTimersByTime(50);
    expect(plain.results()).toEqual([]);

    TestBed.resetTestingModule();
    const awaited = typeWithoutTick('ang');

    await vi.advanceTimersByTimeAsync(300);
    expect(awaited.search).toHaveBeenCalledWith('ang');
    expect(awaited.results()).toEqual([]);

    await vi.advanceTimersByTimeAsync(50);
    expect(awaited.results()).toEqual(['ang one']);
  });
});
