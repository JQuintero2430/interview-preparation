import { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject, interval, map } from 'rxjs';
import { countingSource } from '../exercise-3-cache-service/counting-source';
import { LeakyWidget, WIDGET_SOURCES } from './legacy/leaky-widget';
import { RefCountWidget, Widget } from './widget';

const TICK_MS = 1000;

// The widget and its `refCount` alternative must pass every test below.
const FIXED: Type<Widget>[] = [Widget, RefCountWidget];

/** Sources the spec can inspect: Subjects report `observed`, counting wrappers report subscriptions and teardowns. */
function mount<T extends { select(id: number): void }>(widgetType: Type<T>) {
  const price = new Subject<number>();
  const detail = new Subject<string>();
  const priceSource = countingSource<number>(() => price);
  const detailSource = countingSource<string>(() => detail);
  const tickSource = countingSource<number>(() => interval(TICK_MS));
  const counts = { price: priceSource.counts, detail: detailSource.counts, tick: tickSource.counts };
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      {
        provide: WIDGET_SOURCES,
        useValue: {
          price$: priceSource.source$,
          tick$: tickSource.source$,
          detail$: (id: number) => detailSource.source$.pipe(map((text) => `${id}:${text}`)),
        },
      },
    ],
  });
  const fixture = TestBed.createComponent(widgetType);
  fixture.detectChanges();
  return { fixture, widget: fixture.componentInstance, price, detail, counts };
}

/** Drives one widget: a price, a selected id with its detail, and two clock ticks. */
function drive(run: ReturnType<typeof mount>) {
  run.price.next(7);
  run.widget.select(1);
  run.detail.next('a');
  vi.advanceTimersByTime(TICK_MS * 2);
  run.fixture.detectChanges();
}

const rendered = (fixture: ComponentFixture<unknown>) =>
  [...(fixture.nativeElement as HTMLElement).querySelectorAll('p')].map((p) => p.textContent);

describe('E23.4 leak-proof component', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('the spec reproduces each of the three legacy leaks (a finalize counter stays 0 or `observed` stays true after destroy)', () => {
    const run = mount(LeakyWidget);
    drive(run);
    run.fixture.destroy();

    expect(run.price.observed).toBe(true);
    expect(run.counts.price.teardowns).toBe(0);
    expect(run.detail.observed).toBe(true);
    expect(run.counts.detail.teardowns).toBe(0);
    expect(run.counts.tick.teardowns).toBe(0);
  });

  it('after the fixed component is destroyed, every source it subscribed reports `observed` false and every finalize counter is 1', () => {
    for (const widgetType of FIXED) {
      const run = mount(widgetType);
      drive(run);
      run.widget.select(2);
      run.fixture.destroy();

      expect(run.price.observed).toBe(false);
      expect(run.detail.observed).toBe(false);
      expect(run.counts.price).toEqual({ subscriptions: 1, teardowns: 1 });
      expect(run.counts.detail).toEqual({ subscriptions: 2, teardowns: 2 });
      expect(run.counts.tick).toEqual({ subscriptions: 1, teardowns: 1 });
    }
  });

  it('no interval timer is pending after destroy (`vi.getTimerCount()` is 0)', () => {
    const leaky = mount(LeakyWidget);
    drive(leaky);
    leaky.fixture.destroy();
    expect(vi.getTimerCount()).toBe(1);
    vi.clearAllTimers();

    for (const widgetType of FIXED) {
      const run = mount(widgetType);
      drive(run);
      expect(vi.getTimerCount()).toBe(1);
      run.fixture.destroy();
      expect(vi.getTimerCount()).toBe(0);
    }
  });

  it('the fixed component renders the same values as the legacy one before destroy', () => {
    const leaky = mount(LeakyWidget);
    drive(leaky);
    expect(rendered(leaky.fixture)).toEqual(['7', '1:a', '1']);

    for (const widgetType of FIXED) {
      const run = mount(widgetType);
      drive(run);
      expect(rendered(run.fixture)).toEqual(rendered(leaky.fixture));
    }
  });
});
