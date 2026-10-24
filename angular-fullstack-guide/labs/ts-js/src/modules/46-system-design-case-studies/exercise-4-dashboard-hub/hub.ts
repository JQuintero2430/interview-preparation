// Exercise 46.4: the types both variants share (a: a class with one interval; b: a machine whose `reduce` returns
// effects for a runner). Our model, not a library's code. `concepts/aggregator.ts` (section 6) is imported read-only:
// it aggregates a window per widget kind and answers `status`. The stream, the snapshot API, the page's visibility
// and the clock are injected, so a test needs no socket, network, browser or real time.
import {
  createAggregator,
  createSeries,
  type Series,
  type Status,
  type WidgetEvent,
  type WidgetSpec,
} from '../concepts/aggregator';

export type { Status, WidgetSpec };

/** An event of the stream, numbered by the server (43 section 8's sequence). */
export interface HubEvent extends WidgetEvent {
  readonly seq: number;
}

/** The state loaded over HTTP, as of sequence `seq`. */
export interface Snapshot {
  readonly seq: number;
  readonly values: Readonly<Record<string, number>>;
}

/** Our stand-in for the HTTP snapshot endpoint. */
export interface SnapshotApi {
  load(): Promise<Snapshot>;
}

/** Our stand-in for the live stream. */
export interface Stream {
  subscribe(listener: (event: HubEvent) => void): () => void;
}

/** Our stand-in for the Page Visibility API: a flag and a change listener (MDN's `hidden` and `visibilitychange`). */
export interface Visibility {
  readonly hidden: boolean;
  onChange(listener: () => void): () => void;
}

/** Receives the values that changed: one window's aggregates, or a whole snapshot. */
export type Render = (values: Readonly<Record<string, number>>) => void;

export type Mode = 'visible' | 'hidden' | 'resyncing';

export interface HubOptions {
  readonly widgets: readonly WidgetSpec[];
  readonly windowMs: number;
  /** Points kept per widget series. */
  readonly capacity: number;
  readonly now: () => number;
  readonly visibility: Visibility;
  readonly stream: Stream;
  readonly snapshots: SnapshotApi;
  readonly render: Render;
}

export interface DataHub {
  status(widgetId: string): Status;
  /** The last value of each widget, kept while the widget is stale. */
  view(): Readonly<Record<string, number>>;
  /** The kept points of one widget, oldest first. */
  series(widgetId: string): readonly number[];
  dispose(): void;
}

/** What both variants share: the aggregator, the series and the last values. They differ only in the pause and resync. */
export interface Board {
  push(event: HubEvent): void;
  /** Ends the window: records its values and renders them, unless no widget had an event. */
  flush(): void;
  /** Ends the window without recording or rendering it. */
  discard(): void;
  /** Replaces the last values with the snapshot's and renders them. */
  show(snapshot: Snapshot): void;
  status(widgetId: string): Status;
  view(): Readonly<Record<string, number>>;
  series(widgetId: string): readonly number[];
}

export function createBoard(options: HubOptions): Board {
  const aggregator = createAggregator(options.widgets);
  const series = new Map(options.widgets.map((widget): [string, Series] => [widget.id, createSeries(options.capacity)]));
  let view: Readonly<Record<string, number>> = {};
  return {
    push: (event) => aggregator.push(event),
    flush() {
      const values = aggregator.flush(options.now());
      if (Object.keys(values).length === 0) return;
      for (const [id, value] of Object.entries(values)) series.get(id)?.add(value);
      view = { ...view, ...values };
      options.render(values);
    },
    discard() {
      aggregator.flush(options.now());
    },
    show(snapshot) {
      view = { ...snapshot.values };
      options.render(snapshot.values);
    },
    status: (widgetId) => aggregator.status(widgetId, options.now()),
    view: () => view,
    series: (widgetId) => series.get(widgetId)?.values() ?? [],
  };
}
