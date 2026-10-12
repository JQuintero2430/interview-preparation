import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LabM18Quick } from './fixtures/lab-m18-quick';
import { LabM18SideEffect } from './fixtures/lab-m18-side-effect';

// --- Hosts: one trigger each, a placeholder with one root element ---

@Component({
  selector: 'lab-m18-s6-idle',
  imports: [LabM18Quick],
  template: `
    @defer (on idle) {
      <lab-m18-quick />
    } @placeholder {
      <p id="placeholder">placeholder</p>
    }
  `,
})
class IdleHost {}

@Component({
  selector: 'lab-m18-s6-interaction',
  imports: [LabM18Quick],
  template: `
    @defer (on interaction) {
      <lab-m18-quick />
    } @placeholder {
      <button id="placeholder" type="button">open</button>
    }
  `,
})
class InteractionHost {}

@Component({
  selector: 'lab-m18-s6-hover',
  imports: [LabM18Quick],
  template: `
    @defer (on hover) {
      <lab-m18-quick />
    } @placeholder {
      <p id="placeholder">placeholder</p>
    }
  `,
})
class HoverHost {}

@Component({
  selector: 'lab-m18-s6-viewport',
  imports: [LabM18Quick],
  template: `
    @defer (on viewport) {
      <lab-m18-quick />
    } @placeholder {
      <p id="placeholder">placeholder</p>
    }
  `,
})
class ViewportHost {}

@Component({
  selector: 'lab-m18-s6-timer',
  imports: [LabM18Quick],
  template: `
    @defer (on timer(100ms)) {
      <lab-m18-quick />
    } @placeholder {
      <p id="placeholder">placeholder</p>
    }
  `,
})
class TimerHost {}

@Component({
  selector: 'lab-m18-s6-when',
  imports: [LabM18Quick],
  template: `
    @defer (when open()) {
      <lab-m18-quick />
    } @placeholder {
      <p id="placeholder">placeholder</p>
    }
  `,
})
class WhenHost {
  readonly open = signal(false);
}

@Component({
  selector: 'lab-m18-s6-prefetch',
  imports: [LabM18SideEffect],
  template: `
    @defer (on interaction; prefetch when warm()) {
      <lab-m18-side-effect />
    } @placeholder {
      <button id="placeholder" type="button">open</button>
    }
  `,
})
class PrefetchHost {
  readonly warm = signal(false);
}

// --- Helpers ---

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function has(fixture: ComponentFixture<unknown>, id: string): boolean {
  fixture.detectChanges();
  const root: HTMLElement = fixture.nativeElement;
  return root.querySelector(`#${id}`) !== null;
}

/** Detects changes every few milliseconds until the condition holds or the limit passes. */
async function until(fixture: ComponentFixture<unknown>, condition: () => boolean, limitMs = 500): Promise<number> {
  const start = performance.now();
  while (!condition() && performance.now() - start < limitMs) {
    await sleep(4);
    fixture.detectChanges();
  }
  return performance.now() - start;
}

function element(fixture: ComponentFixture<unknown>, id: string): HTMLElement {
  const root: HTMLElement = fixture.nativeElement;
  return root.querySelector<HTMLElement>(`#${id}`)!;
}

/** jsdom has no IntersectionObserver: a stand-in that records calls and fires on demand. */
class FakeIntersectionObserver {
  static readonly instances: FakeIntersectionObserver[] = [];
  readonly observed: Element[] = [];

  constructor(
    private readonly callback: IntersectionObserverCallback,
    readonly options?: IntersectionObserverInit,
  ) {
    FakeIntersectionObserver.instances.push(this);
  }

  observe(target: Element): void {
    this.observed.push(target);
  }
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
  enter(target: Element): void {
    const entry = { isIntersecting: true, target } as IntersectionObserverEntry;
    this.callback([entry], this as unknown as IntersectionObserver);
  }
}

describe('Section 6: triggers', () => {
  const host = globalThis as { IntersectionObserver?: unknown };
  let original: unknown;

  beforeEach(() => {
    original = host.IntersectionObserver;
    FakeIntersectionObserver.instances.length = 0;
    host.IntersectionObserver = FakeIntersectionObserver;
  });

  afterEach(() => {
    host.IntersectionObserver = original;
  });

  it('Section 6: on idle renders the content without user input', async () => {
    // jsdom has no requestIdleCallback, so the setTimeout fallback of the idle service runs.
    expect(typeof requestIdleCallback).toBe('undefined');
    const fixture = TestBed.createComponent(IdleHost);
    expect(has(fixture, 'placeholder')).toBe(true);
    await until(fixture, () => has(fixture, 'content'));
    expect(has(fixture, 'content')).toBe(true);
    expect(has(fixture, 'placeholder')).toBe(false);
  });

  it('Section 6: on interaction waits for a click on the placeholder', async () => {
    const fixture = TestBed.createComponent(InteractionHost);
    await until(fixture, () => has(fixture, 'content'), 60);
    expect(has(fixture, 'content')).toBe(false);
    element(fixture, 'placeholder').click();
    await until(fixture, () => has(fixture, 'content'));
    expect(has(fixture, 'content')).toBe(true);
  });

  it('Section 6: on hover waits for mouseover', async () => {
    const fixture = TestBed.createComponent(HoverHost);
    await until(fixture, () => has(fixture, 'content'), 60);
    expect(has(fixture, 'content')).toBe(false);
    element(fixture, 'placeholder').dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    await until(fixture, () => has(fixture, 'content'));
    expect(has(fixture, 'content')).toBe(true);
  });

  it('Section 6: on viewport waits for the observer callback', async () => {
    const fixture = TestBed.createComponent(ViewportHost);
    await until(fixture, () => has(fixture, 'content'), 60);
    expect(has(fixture, 'content')).toBe(false);
    expect(FakeIntersectionObserver.instances).toHaveLength(1);
    const [observer] = FakeIntersectionObserver.instances;
    expect(observer.observed).toEqual([element(fixture, 'placeholder')]);
    expect(observer.options).toBeUndefined();
    observer.enter(element(fixture, 'placeholder'));
    await until(fixture, () => has(fixture, 'content'));
    expect(has(fixture, 'content')).toBe(true);
  });

  it('Section 6: on timer holds the placeholder until the delay', async () => {
    const fixture = TestBed.createComponent(TimerHost);
    expect(has(fixture, 'placeholder')).toBe(true);
    const waited = await until(fixture, () => has(fixture, 'content'));
    expect(has(fixture, 'content')).toBe(true);
    expect(waited).toBeGreaterThanOrEqual(90);
  });

  it('Section 6: when fires once and stays rendered', async () => {
    const fixture = TestBed.createComponent(WhenHost);
    await until(fixture, () => has(fixture, 'content'), 60);
    expect(has(fixture, 'placeholder')).toBe(true);
    fixture.componentInstance.open.set(true);
    await until(fixture, () => has(fixture, 'content'));
    expect(has(fixture, 'content')).toBe(true);
    fixture.componentInstance.open.set(false);
    await until(fixture, () => has(fixture, 'placeholder'), 60);
    expect(has(fixture, 'content')).toBe(true);
    expect(has(fixture, 'placeholder')).toBe(false);
  });

  it('Section 6: prefetch when loads the module while the placeholder stays', async () => {
    const loaded = () => (globalThis as { labM18Loaded?: string[] }).labM18Loaded ?? [];
    const fixture = TestBed.createComponent(PrefetchHost);
    await until(fixture, () => loaded().length > 0, 60);
    expect(loaded()).toEqual([]);

    fixture.componentInstance.warm.set(true);
    await until(fixture, () => loaded().length > 0);
    expect(loaded()).toEqual(['lab-m18-side-effect evaluated']);
    expect(has(fixture, 'placeholder')).toBe(true);
    expect(has(fixture, 'content')).toBe(false);

    element(fixture, 'placeholder').click();
    await until(fixture, () => has(fixture, 'content'));
    expect(has(fixture, 'content')).toBe(true);
    expect(loaded()).toEqual(['lab-m18-side-effect evaluated']);
  });
});
