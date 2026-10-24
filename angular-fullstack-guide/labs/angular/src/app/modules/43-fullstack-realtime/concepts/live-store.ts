// Section 8: from a shared socket to signals. `liveConnection` owns one `liveSocket` (Section 6, read-only) for every
// reader: `share` with a grace period keeps it open for a moment after the last reader leaves, so a route change does not
// reconnect, and a `state` signal says whether the data is live. `LiveStore` applies a snapshot, then deltas in order by
// sequence number, reloads the snapshot once on a gap, and conflates a burst into one signal write per window. Nothing
// here opens a connection until something subscribes, and the components subscribe only after the first render (browser).
import {
  Component,
  Injector,
  InjectionToken,
  afterNextRender,
  computed,
  inject,
  signal,
  type Signal,
  type WritableSignal,
} from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { Observable, Subscription, auditTime, defer, filter, finalize, share, tap, timer } from 'rxjs';
import { liveSocket, type Backoff } from './live-socket';

export type ConnectionState = 'connecting' | 'open' | 'reconnecting' | 'closed';
type SocketCtor = new (url: string, protocols?: string | string[]) => WebSocket;

export interface LiveConnectionConfig {
  readonly url: string;
  readonly backoff: Backoff;
  readonly random: () => number;
  /** How long the socket stays open after the last reader leaves. */
  readonly graceMs: number;
  readonly WebSocketCtor?: SocketCtor;
}

export interface LiveConnection<T> {
  readonly messages$: Observable<T>;
  readonly state: Signal<ConnectionState>;
}

export function liveConnection<T>(config: LiveConnectionConfig): LiveConnection<T> {
  const state = signal<ConnectionState>('closed');
  const messages$ = defer(() => {
    // Built per run, so nothing touches `WebSocket` until the first reader subscribes.
    state.set('connecting');
    const WebSocketCtor = tracked(config.WebSocketCtor ?? WebSocket, state);
    return liveSocket<T>({ ...config, WebSocketCtor }).messages$;
  }).pipe(
    finalize(() => state.set('closed')),
    share({ resetOnRefCountZero: () => timer(config.graceMs) }),
  );
  return { messages$, state: state.asReadonly() };
}

/** A socket class that reports `open` and every `close` to the state signal; `liveSocket` stays untouched. */
function tracked(Base: SocketCtor, state: WritableSignal<ConnectionState>): SocketCtor {
  return class extends Base {
    constructor(url: string, protocols?: string | string[]) {
      super(url, protocols);
      this.addEventListener('open', () => state.set('open'));
      this.addEventListener('close', () => state.update((now) => (now === 'closed' ? now : 'reconnecting')));
    }
  };
}

export interface Row {
  readonly id: string;
}
export interface Snapshot<R extends Row> {
  readonly seq: number;
  readonly rows: readonly R[];
}
export interface Delta<R extends Row> {
  readonly seq: number;
  readonly row: R;
}

export class LiveStore<R extends Row> {
  private readonly byId = new Map<string, R>();
  private readonly published = signal<readonly R[]>([]);
  private lastSeq = 0;
  private dirty = false;
  private reloading = false;
  private queued: Delta<R>[] = [];

  readonly rows: Signal<readonly R[]> = this.published.asReadonly();
  /** True from a detected gap until the reloaded snapshot is in. */
  readonly stale = signal(false);
  /** How many times `rows` was written; a test reads it to count updates. */
  publishCount = 0;

  constructor(private readonly loadSnapshot: () => Promise<Snapshot<R>>) {}

  applySnapshot(snapshot: Snapshot<R>): void {
    this.byId.clear();
    for (const row of snapshot.rows) this.byId.set(row.id, row);
    this.lastSeq = snapshot.seq;
    this.dirty = true;
    this.flush();
  }

  applyDelta(delta: Delta<R>): void {
    if (this.reloading) {
      this.queued.push(delta);
    } else if (delta.seq <= this.lastSeq) {
      return; // already in the snapshot, or a duplicate
    } else if (delta.seq > this.lastSeq + 1) {
      this.queued.push(delta);
      this.reload().catch(() => undefined); // `stale` stays true; the next gap tries again
    } else {
      this.byId.set(delta.row.id, delta.row);
      this.lastSeq = delta.seq;
      this.dirty = true;
    }
  }

  async reload(): Promise<void> {
    if (this.reloading) return;
    this.reloading = true;
    this.stale.set(true);
    try {
      this.applySnapshot(await this.loadSnapshot());
    } finally {
      this.reloading = false;
    }
    const waiting = this.queued.sort((a, b) => a.seq - b.seq);
    this.queued = [];
    for (const delta of waiting) this.applyDelta(delta);
    this.stale.set(this.reloading);
    this.flush();
  }

  /** Publishes the map as one array and one signal write, when something changed. */
  flush(): void {
    if (!this.dirty) return;
    this.dirty = false;
    this.publishCount++;
    this.published.set([...this.byId.values()]);
  }

  /** Applies every delta at once, but publishes at most once per window. */
  connect(deltas$: Observable<Delta<R>>, windowMs: number): Subscription {
    return deltas$.pipe(tap((delta) => this.applyDelta(delta)), auditTime(windowMs)).subscribe(() => this.flush());
  }
}

export interface PriceTick extends Row {
  readonly price: number;
}

export const LAB_M43_CONNECTION = new InjectionToken<LiveConnection<PriceTick>>('LAB_M43_CONNECTION');

/** Reads the latest message and the state after the first render, so a server render opens no socket. */
@Component({
  selector: 'lab-m43-live-latest',
  template: `<p>{{ connection.state() }}: {{ latest()?.price ?? 'waiting' }}</p>`,
})
export class LabM43LiveLatest {
  private readonly injector = inject(Injector);
  protected readonly connection = inject(LAB_M43_CONNECTION);
  private readonly source = signal<Signal<PriceTick | undefined> | undefined>(undefined);
  protected readonly latest = computed(() => this.source()?.());

  constructor() {
    afterNextRender(() => this.source.set(toSignal(this.connection.messages$, { injector: this.injector })));
  }
}

/** The same stream through `rxResource`: `undefined` params keep it idle until the first render. */
@Component({
  selector: 'lab-m43-live-topic',
  template: `<p>{{ latest.value()?.price ?? latest.status() }}</p>`,
})
export class LabM43LiveTopic {
  private readonly connection = inject(LAB_M43_CONNECTION);
  private readonly rendered = signal(false);
  protected readonly latest = rxResource({
    params: () => (this.rendered() ? 'AAA' : undefined),
    stream: ({ params }) => this.connection.messages$.pipe(filter((tick) => tick.id === params)),
  });

  constructor() {
    afterNextRender(() => this.rendered.set(true));
  }
}
