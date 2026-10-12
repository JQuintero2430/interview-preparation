import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, interval, map, mergeMap, throwError, timer } from 'rxjs';
import { AppConfig, CONFIG_LOADER, ConfigCache, ShareConfigCache } from './config-cache';
import { Counts, countingSource } from './counting-source';
import { GRACE_MS, LivePrices, PRICE_SOURCE } from './live-prices';

const LOAD_MS = 10;
const TICK_MS = 1000;

// The text solution and its `share`-based alternative must pass every cache test below.
const CACHES: Type<ConfigCache>[] = [ConfigCache, ShareConfigCache];

let tracked: Counts[] = [];

/** A cache over a counting loader: run `n` answers `{ version: n }` after LOAD_MS, or fails when `failRuns` has `n`. */
function cacheOf(cacheType: Type<ConfigCache>, failRuns: number[] = []) {
  const { source$, counts } = countingSource<AppConfig>((run) =>
    failRuns.includes(run)
      ? timer(LOAD_MS).pipe(mergeMap(() => throwError(() => new Error('down'))))
      : timer(LOAD_MS).pipe(map(() => ({ version: run }))),
  );
  tracked.push(counts);
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [cacheType, { provide: CONFIG_LOADER, useValue: source$ }] });
  return { cache: TestBed.inject(cacheType), counts };
}

function pricesOf() {
  const { source$, counts } = countingSource<number>(() => interval(TICK_MS));
  tracked.push(counts);
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [LivePrices, { provide: PRICE_SOURCE, useValue: source$ }] });
  return { prices: TestBed.inject(LivePrices), counts };
}

const collect = <T>(stream: Observable<T>) => {
  const values: T[] = [];
  const subscription = stream.subscribe((v) => values.push(v));
  return { values, subscription };
};

describe('E23.3 cache service', () => {
  beforeEach(() => {
    tracked = [];
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    for (const counts of tracked) {
      expect(counts.teardowns).toBe(counts.subscriptions);
    }
  });

  it('two subscribers to `config$` cause one load, and a late subscriber gets the cached value without a load', () => {
    for (const cacheType of CACHES) {
      const { cache, counts } = cacheOf(cacheType);
      const a = collect(cache.config$);
      const b = collect(cache.config$);
      vi.advanceTimersByTime(LOAD_MS);
      const late = collect(cache.config$);
      expect(a.values).toEqual([{ version: 1 }]);
      expect(b.values).toEqual([{ version: 1 }]);
      expect(late.values).toEqual([{ version: 1 }]);
      expect(counts.subscriptions).toBe(1);
    }
  });

  it('a failed load is not cached: the next subscriber loads again', () => {
    for (const cacheType of CACHES) {
      const { cache, counts } = cacheOf(cacheType, [1]);
      const errors: unknown[] = [];
      cache.config$.subscribe({ error: (e: unknown) => errors.push(String(e)) });
      vi.advanceTimersByTime(LOAD_MS);
      expect(errors).toEqual(['Error: down']);
      const next = collect(cache.config$);
      vi.advanceTimersByTime(LOAD_MS);
      expect(next.values).toEqual([{ version: 2 }]);
      expect(counts.subscriptions).toBe(2);
    }
  });

  it('`refresh()` makes the next subscriber (and current ones) receive a newly loaded value', () => {
    for (const cacheType of CACHES) {
      const { cache, counts } = cacheOf(cacheType);
      const a = collect(cache.config$);
      const b = collect(cache.config$);
      vi.advanceTimersByTime(LOAD_MS);
      cache.refresh();
      vi.advanceTimersByTime(LOAD_MS);
      const next = collect(cache.config$);
      expect(a.values).toEqual([{ version: 1 }, { version: 2 }]);
      expect(b.values).toEqual([{ version: 1 }, { version: 2 }]);
      expect(next.values).toEqual([{ version: 2 }]);
      expect(counts.subscriptions).toBe(2);
    }
  });

  it('LivePrices stops its source when the last subscriber leaves after the grace period and keeps it when a subscriber returns within it (`resetOnRefCountZero: () => timer(n)`)', () => {
    const { prices, counts } = pricesOf();
    const a = collect(prices.prices$);
    vi.advanceTimersByTime(2500);
    a.subscription.unsubscribe();
    vi.advanceTimersByTime(1000);
    const b = collect(prices.prices$);
    vi.advanceTimersByTime(500);
    expect(a.values).toEqual([0, 1]);
    expect(b.values).toEqual([3]);
    expect(counts).toEqual({ subscriptions: 1, teardowns: 0 });
    b.subscription.unsubscribe();
    vi.advanceTimersByTime(GRACE_MS - 1);
    expect(counts.teardowns).toBe(0);
    vi.advanceTimersByTime(1);
    expect(counts).toEqual({ subscriptions: 1, teardowns: 1 });
  });

  it('a subscriber arriving after the source stopped receives a fresh value, never a stale one', () => {
    const { prices, counts } = pricesOf();
    const a = collect(prices.prices$);
    vi.advanceTimersByTime(TICK_MS * 5);
    a.subscription.unsubscribe();
    vi.advanceTimersByTime(GRACE_MS);
    const b = collect(prices.prices$);
    expect(b.values).toEqual([]);
    vi.advanceTimersByTime(TICK_MS);
    expect(a.values).toEqual([0, 1, 2, 3, 4]);
    expect(b.values).toEqual([0]);
    expect(counts.subscriptions).toBe(2);
    b.subscription.unsubscribe();
    vi.advanceTimersByTime(GRACE_MS);
  });

  it("the counting source's teardown count proves no source stays subscribed at the end of each test", () => {
    const { prices, counts } = pricesOf();
    const a = collect(prices.prices$);
    expect(counts).toEqual({ subscriptions: 1, teardowns: 0 });
    a.subscription.unsubscribe();
    vi.advanceTimersByTime(GRACE_MS);
    expect(counts.teardowns).toBe(counts.subscriptions);
  });
});
