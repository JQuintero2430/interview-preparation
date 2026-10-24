// Section 6 model: one value per widget per window, a stale mark per widget, and a bounded series. Our model; the
// conflation of a stream into signals is 43 section 8's, not rebuilt here. Our percentile is the nearest-rank definition:
// sort the window ascending, take the value at rank ceil(0.95 * n) (1-based). Other tools interpolate and give other
// numbers for the same data. Plain values only: the caller passes every time as a number, so there is no clock,
// timer, socket, randomness or network.

export type WidgetKind = 'counter' | 'gauge' | 'latency';

export interface WidgetSpec {
  readonly id: string;
  readonly kind: WidgetKind;
  /** Past this many milliseconds without an event the widget is marked stale. */
  readonly staleAfterMs: number;
}

export interface WidgetEvent {
  readonly widgetId: string;
  readonly value: number;
  readonly at: number;
}

export type Status = 'live' | 'stale';

export interface Aggregator {
  push(event: WidgetEvent): void;
  /** One value per widget that had events in the window; the window is then emptied. */
  flush(now: number): Readonly<Record<string, number>>;
  status(widgetId: string, now: number): Status;
}

/** Our nearest-rank 95th percentile of a non-empty list. */
export function p95(values: readonly number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.ceil(0.95 * sorted.length) - 1] as number;
}

const reduce: Record<WidgetKind, (values: readonly number[]) => number> = {
  counter: (values) => values.reduce((sum, value) => sum + value, 0),
  gauge: (values) => values[values.length - 1] as number,
  latency: p95,
};

export function createAggregator(widgets: readonly WidgetSpec[]): Aggregator {
  const specs = new Map(widgets.map((spec) => [spec.id, spec]));
  let current = new Map<string, number[]>();
  const lastSeen = new Map<string, number>();

  return {
    push({ widgetId, value, at }) {
      if (!specs.has(widgetId)) return;
      current.set(widgetId, [...(current.get(widgetId) ?? []), value]);
      lastSeen.set(widgetId, at);
    },
    flush() {
      const out: Record<string, number> = {};
      for (const [id, values] of current) out[id] = reduce[specs.get(id)!.kind](values);
      current = new Map();
      return out;
    },
    status(widgetId, now) {
      const seen = lastSeen.get(widgetId);
      const limit = specs.get(widgetId)?.staleAfterMs ?? 0;
      return seen !== undefined && now - seen <= limit ? 'live' : 'stale';
    },
  };
}

export interface Series {
  add(value: number): void;
  /** The kept points, oldest first. */
  values(): readonly number[];
}

/** A ring buffer: memory stays at `capacity` points however long the screen stays open. */
export function createSeries(capacity: number): Series {
  const ring: number[] = [];
  let next = 0;
  return {
    add(value) {
      ring[next] = value;
      next = (next + 1) % capacity;
    },
    values() {
      return ring.length < capacity ? [...ring] : [...ring.slice(next), ...ring.slice(0, next)];
    },
  };
}
