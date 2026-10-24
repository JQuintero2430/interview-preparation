// Section 6 claims, about our model (aggregator.ts), not a charting library's: within a window a counter sums and a
// gauge keeps the last value, a latency widget reports our nearest-rank 95th percentile, a widget past its stale limit
// is marked stale until its next event, and a series keeps the newest points up to its capacity. Times are numbers
// the test passes; no clock, timer, network or randomness.
import { describe, expect, it } from 'vitest';
import { createAggregator, createSeries, type WidgetSpec } from './aggregator';

const widgets: readonly WidgetSpec[] = [
  { id: 'orders', kind: 'counter', staleAfterMs: 5000 },
  { id: 'cpu', kind: 'gauge', staleAfterMs: 5000 },
  { id: 'api', kind: 'latency', staleAfterMs: 5000 },
];

describe('Section 6: aggregator', () => {
  it('Section 6: within one window a counter sums its events and a gauge keeps the last value', () => {
    const hub = createAggregator(widgets);
    for (const [i, value] of [3, 4, 5].entries()) hub.push({ widgetId: 'orders', value, at: i });
    for (const [i, value] of [70, 90, 40].entries()) hub.push({ widgetId: 'cpu', value, at: i });
    expect(hub.flush(250)).toEqual({ orders: 12, cpu: 40 });
    expect(hub.flush(500)).toEqual({});
  });

  it('Section 6: a latency widget reports the nearest-rank 95th percentile of its window', () => {
    const hub = createAggregator(widgets);
    for (let ms = 1; ms <= 20; ms += 1) hub.push({ widgetId: 'api', value: ms * 10, at: ms });
    // 20 values: rank ceil(0.95 * 20) = 19, so the 19th smallest, 190 (not the maximum, 200).
    expect(hub.flush(250)).toEqual({ api: 190 });
  });

  it('Section 6: a widget with no event for longer than its stale limit is marked stale, and the next event clears it', () => {
    const hub = createAggregator(widgets);
    expect(hub.status('orders', 0)).toBe('stale');
    hub.push({ widgetId: 'orders', value: 1, at: 1000 });
    expect(hub.status('orders', 6000)).toBe('live');
    expect(hub.status('orders', 6001)).toBe('stale');
    hub.push({ widgetId: 'orders', value: 1, at: 7000 });
    expect(hub.status('orders', 7001)).toBe('live');
    expect(hub.status('cpu', 7001)).toBe('stale');
  });

  it('Section 6: the series keeps the newest points up to its capacity and drops the oldest', () => {
    const series = createSeries(3);
    series.add(1);
    series.add(2);
    expect(series.values()).toEqual([1, 2]);
    for (const value of [3, 4, 5]) series.add(value);
    expect(series.values()).toEqual([3, 4, 5]);
  });
});
