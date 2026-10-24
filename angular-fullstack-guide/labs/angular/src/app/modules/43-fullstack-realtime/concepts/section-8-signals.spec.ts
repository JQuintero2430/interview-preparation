import { EnvironmentInjector, createEnvironmentInjector, effect, provideZonelessChangeDetection } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TestBed } from '@angular/core/testing';
import { Subject, shareReplay } from 'rxjs';
import { FakeWebSocket } from './testing/fake-web-socket';
import { liveSocket } from './live-socket';
import {
  LAB_M43_CONNECTION,
  LabM43LiveLatest,
  LabM43LiveTopic,
  LiveStore,
  liveConnection,
  type Delta,
  type PriceTick,
  type Snapshot,
} from './live-store';

// Every socket is our fake passed as `WebSocketCtor`: no test opens a connection. Waits run on Vitest fake timers
// (except the component test, which renders through the zoneless scheduler), and the jitter source is fixed.
const config = {
  url: 'wss://app.example.com/ws',
  backoff: { initialMs: 1000, maxMs: 30000 },
  random: () => 1,
  graceMs: 5000,
  WebSocketCtor: FakeWebSocket,
};

function socketAt(index: number): FakeWebSocket {
  const socket = FakeWebSocket.instances[index];
  if (socket === undefined) throw new Error(`no socket ${index} was created`);
  return socket;
}

function readerScope(): EnvironmentInjector {
  return createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));
}

describe('Section 8: from streams to signals', () => {
  beforeEach(() => {
    FakeWebSocket.instances.length = 0;
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    vi.useFakeTimers();
  });
  afterEach(() => vi.useRealTimers());

  it('Section 8: two subscribers share one socket', async () => {
    vi.useRealTimers();
    const connection = liveConnection<PriceTick>(config);
    TestBed.configureTestingModule({ providers: [{ provide: LAB_M43_CONNECTION, useValue: connection }] });
    const latest = TestBed.createComponent(LabM43LiveLatest);
    const topic = TestBed.createComponent(LabM43LiveTopic);
    // Nothing is opened before the first render.
    expect(FakeWebSocket.instances).toHaveLength(0);
    expect(connection.state()).toBe('closed');

    // The first tick runs the render hooks; the resource then loads in its own effect, one tick later.
    TestBed.tick();
    await Promise.resolve();
    TestBed.tick();
    expect(FakeWebSocket.instances).toHaveLength(1);
    expect(connection.state()).toBe('connecting');

    socketAt(0).open();
    socketAt(0).receive('{"id":"AAA","price":101}');
    await Promise.resolve();
    TestBed.tick();
    expect(connection.state()).toBe('open');
    expect(latest.nativeElement.textContent).toBe('open: 101');
    expect(topic.nativeElement.textContent).toBe('101');
    expect(FakeWebSocket.instances).toHaveLength(1);
  });

  it('Section 8: the socket closes after the last subscriber leaves and the grace period ends', () => {
    const connection = liveConnection<PriceTick>(config);
    const first = readerScope();
    const second = readerScope();
    toSignal(connection.messages$, { injector: first });
    toSignal(connection.messages$, { injector: second });
    socketAt(0).open();
    expect(FakeWebSocket.instances).toHaveLength(1);

    // `toSignal` unsubscribes only its own reader, so the source stays open for the other one.
    first.destroy();
    vi.advanceTimersByTime(60_000);
    expect(socketAt(0).closeCalls).toHaveLength(0);

    // The last reader leaves; a reader returning inside the grace period keeps the same socket.
    second.destroy();
    vi.advanceTimersByTime(4999);
    const returning = readerScope();
    toSignal(connection.messages$, { injector: returning });
    vi.advanceTimersByTime(60_000);
    expect(FakeWebSocket.instances).toHaveLength(1);
    expect(socketAt(0).closeCalls).toHaveLength(0);

    returning.destroy();
    vi.advanceTimersByTime(4999);
    expect(socketAt(0).closeCalls).toHaveLength(0);
    expect(connection.state()).toBe('open');
    vi.advanceTimersByTime(1);
    expect(socketAt(0).closeCalls).toHaveLength(1);
    expect(connection.state()).toBe('closed');
  });

  it('Section 8: shareReplay(1) without refCount keeps the socket open after the last subscriber leaves', () => {
    const subscription = liveSocket<PriceTick>(config).messages$.pipe(shareReplay(1)).subscribe();
    socketAt(0).open();
    subscription.unsubscribe();
    vi.advanceTimersByTime(60_000);

    expect(socketAt(0).closeCalls).toHaveLength(0);
    expect(socketAt(0).readyState).toBe(socketAt(0).OPEN);
  });

  it('Section 8: a delta with a sequence gap triggers one snapshot reload', async () => {
    const snapshots: Snapshot<PriceTick>[] = [
      { seq: 10, rows: [{ id: 'A', price: 1 }] },
      {
        seq: 14,
        rows: [
          { id: 'A', price: 4 },
          { id: 'B', price: 2 },
        ],
      },
    ];
    let loads = 0;
    const store = new LiveStore<PriceTick>(() => {
      loads++;
      const next = snapshots.shift();
      if (next === undefined) throw new Error('no snapshot is queued');
      return Promise.resolve(next);
    });
    await store.reload();
    expect(loads).toBe(1);

    store.applyDelta({ seq: 9, row: { id: 'A', price: 99 } }); // already in the snapshot
    store.applyDelta({ seq: 11, row: { id: 'A', price: 11 } });
    store.flush();
    expect(store.rows()).toEqual([{ id: 'A', price: 11 }]);

    // 12 never arrives: 13 is a gap, so one reload starts and 14 and 15 wait behind it.
    store.applyDelta({ seq: 13, row: { id: 'A', price: 13 } });
    expect(store.stale()).toBe(true);
    store.applyDelta({ seq: 14, row: { id: 'B', price: 14 } });
    store.applyDelta({ seq: 15, row: { id: 'A', price: 15 } });
    expect(loads).toBe(2);

    await vi.advanceTimersByTimeAsync(0);
    expect(loads).toBe(2);
    expect(store.stale()).toBe(false);
    expect(store.rows()).toEqual([
      { id: 'A', price: 15 },
      { id: 'B', price: 2 },
    ]);
  });

  it('Section 8: 500 messages in one frame produce one signal update', () => {
    const store = new LiveStore<PriceTick>(() => Promise.resolve({ seq: 0, rows: [] }));
    store.applySnapshot({ seq: 0, rows: [] });
    const deltas$ = new Subject<Delta<PriceTick>>();
    store.connect(deltas$, 16);
    const readerRuns: number[] = [];
    TestBed.runInInjectionContext(() => effect(() => readerRuns.push(store.rows().length)));
    TestBed.tick();
    const before = store.publishCount;

    for (let seq = 1; seq <= 500; seq++) deltas$.next({ seq, row: { id: `P${seq % 5}`, price: seq } });
    expect(store.publishCount).toBe(before);
    expect(store.rows()).toEqual([]);

    vi.advanceTimersByTime(16);
    TestBed.tick();
    expect(store.publishCount).toBe(before + 1);
    expect(store.rows()).toHaveLength(5);
    expect(store.rows().find((row) => row.id === 'P0')?.price).toBe(500);
    expect(readerRuns).toEqual([0, 5]);
  });
});
