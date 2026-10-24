// Exercise 46.4: six criteria, each run over both variants (a: a class on the global interval; b: a machine whose
// effects a runner performs; both under Vitest fake timers). `FakeStream` is our stream, `FakeSnapshotApi` our
// snapshot endpoint (it answers only when the test says so) and `FakeVisibility` our page visibility. The clock is
// the fake timers' (reset to 0 before each test). No network, socket, real time or randomness.
import * as a from './a/hub';
import * as b from './b/hub';
import type { DataHub, HubEvent, HubOptions, Snapshot, SnapshotApi, Stream, Visibility, WidgetSpec } from './hub';

const WINDOW = 250;
const WIDGETS: readonly WidgetSpec[] = [
  { id: 'orders', kind: 'counter', staleAfterMs: 5000 },
  { id: 'cpu', kind: 'gauge', staleAfterMs: 5000 },
];

class FakeStream implements Stream {
  private readonly listeners = new Set<(event: HubEvent) => void>();

  subscribe(listener: (event: HubEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(event: HubEvent): void {
    for (const listener of this.listeners) listener(event);
  }
}

class FakeSnapshotApi implements SnapshotApi {
  calls = 0;
  private readonly pending: ((snapshot: Snapshot) => void)[] = [];

  load(): Promise<Snapshot> {
    this.calls += 1;
    return new Promise((resolve) => this.pending.push(resolve));
  }

  /** Answers the oldest request. */
  respond(snapshot: Snapshot): void {
    this.pending.shift()?.(snapshot);
  }
}

class FakeVisibility implements Visibility {
  private readonly listeners = new Set<() => void>();

  constructor(public hidden: boolean) {}

  onChange(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  set(hidden: boolean): void {
    this.hidden = hidden;
    for (const listener of this.listeners) listener();
  }
}

/** Lets every promise already resolved run its continuation. */
async function settle(): Promise<void> {
  for (let i = 0; i < 10; i += 1) await Promise.resolve();
}

describe.each(['a', 'b'])('Exercise 46.4, variant %s', (variant) => {
  const hubs: DataHub[] = [];

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
  });
  afterEach(() => {
    for (const hub of hubs.splice(0)) hub.dispose();
    vi.useRealTimers();
  });

  function setup(config: { hidden?: boolean; capacity?: number } = {}) {
    const stream = new FakeStream();
    const snapshots = new FakeSnapshotApi();
    const visibility = new FakeVisibility(config.hidden ?? false);
    const renders: Record<string, number>[] = [];
    const options: HubOptions = {
      widgets: WIDGETS,
      windowMs: WINDOW,
      capacity: config.capacity ?? 10,
      now: () => Date.now(),
      visibility,
      stream,
      snapshots,
      render: (values) => {
        renders.push({ ...values });
      },
    };
    const hub = variant === 'a' ? new a.DashboardHub(options) : new b.MachineHub(options);
    hubs.push(hub);
    return {
      hub,
      snapshots,
      visibility,
      renders,
      send: (seq: number, widgetId: string, value: number) => stream.emit({ widgetId, seq, value, at: Date.now() }),
      elapse: (ms: number) => vi.advanceTimersByTimeAsync(ms),
    };
  }

  it('renders at most once per window with each widget\'s aggregate', async () => {
    const t = setup();
    t.send(1, 'orders', 3);
    t.send(2, 'cpu', 70);
    t.send(3, 'orders', 4);
    t.send(4, 'orders', 5);
    t.send(5, 'cpu', 40);
    await t.elapse(WINDOW - 1);
    expect(t.renders).toEqual([]);
    await t.elapse(1);
    expect(t.renders).toEqual([{ orders: 12, cpu: 40 }]);
    t.send(6, 'orders', 1);
    await t.elapse(WINDOW);
    await t.elapse(WINDOW);
    expect(t.renders).toEqual([{ orders: 12, cpu: 40 }, { orders: 1 }]);
  });

  it('emits no render while the page is hidden', async () => {
    const t = setup();
    t.send(1, 'orders', 1);
    t.visibility.set(true);
    t.send(2, 'orders', 1);
    await t.elapse(4 * WINDOW);
    expect(t.renders).toEqual([]);
    expect(t.snapshots.calls).toBe(0);
  });

  it('on becoming visible, loads one snapshot and applies only events with a sequence above it', async () => {
    const t = setup({ hidden: true });
    t.send(1, 'orders', 1);
    t.send(2, 'orders', 1);
    t.send(3, 'orders', 1);
    t.visibility.set(false);
    expect(t.snapshots.calls).toBe(1);
    t.send(4, 'orders', 50);
    t.send(5, 'orders', 7);
    t.snapshots.respond({ seq: 4, values: { orders: 100, cpu: 20 } });
    await settle();
    expect(t.renders).toEqual([{ orders: 100, cpu: 20 }]);
    await t.elapse(WINDOW);
    expect(t.renders).toEqual([{ orders: 100, cpu: 20 }, { orders: 7 }]);
    expect(t.snapshots.calls).toBe(1);
  });

  it('marks a widget stale after its limit without events, keeps its last value, and clears the mark on the next event', async () => {
    const t = setup();
    t.send(1, 'orders', 5);
    await t.elapse(5000);
    expect(t.hub.status('orders')).toBe('live');
    await t.elapse(1);
    expect(t.hub.status('orders')).toBe('stale');
    expect(t.hub.view()).toEqual({ orders: 5 });
    expect(t.renders).toEqual([{ orders: 5 }]);
    t.send(2, 'orders', 1);
    expect(t.hub.status('orders')).toBe('live');
    expect(t.hub.status('cpu')).toBe('stale');
  });

  it('drops events older than the snapshot that arrive after the resync', async () => {
    const t = setup({ hidden: true });
    t.visibility.set(false);
    t.snapshots.respond({ seq: 10, values: { orders: 100 } });
    await settle();
    t.send(9, 'orders', 50);
    t.send(11, 'orders', 1);
    await t.elapse(WINDOW);
    expect(t.renders).toEqual([{ orders: 100 }, { orders: 1 }]);
  });

  it("keeps each widget's series within its capacity", async () => {
    const t = setup({ capacity: 3 });
    for (let seq = 1; seq <= 5; seq += 1) {
      t.send(seq, 'orders', seq);
      await t.elapse(WINDOW);
    }
    expect(t.hub.series('orders')).toEqual([3, 4, 5]);
    expect(t.hub.series('cpu')).toEqual([]);
  });
});
