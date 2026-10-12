import { TestBed } from '@angular/core/testing';
import { Observable, Subject } from 'rxjs';
import { DASHBOARD_SOURCES, DashboardFeed, DashboardView, OrderFilter } from './dashboard-feed';
import { FakeSources, createFakeSources } from './fake-sources';

function setUp(fake: FakeSources): DashboardFeed {
  TestBed.configureTestingModule({ providers: [DashboardFeed, { provide: DASHBOARD_SOURCES, useValue: fake.sources }] });
  return TestBed.inject(DashboardFeed);
}

/** Records each notification as a short string (JSON unless `show` says otherwise). */
function record<T>(source: Observable<T>, log: string[], show: (value: T) => string = (v) => JSON.stringify(v)) {
  return source.subscribe({
    next: (v) => log.push(show(v)),
    error: (e: unknown) => log.push(`error ${(e as Error).message}`),
    complete: () => log.push('complete'),
  });
}

const viewText = (view: DashboardView) => `${view.filter}:${view.orders}@${view.tick}`;

/** Advances the fake clock to an absolute time. */
function clock() {
  let now = 0;
  return (t: number) => {
    vi.advanceTimersByTime(t - now);
    now = t;
  };
}

const startsOf = (fake: FakeSources) => [fake.users.starts, fake.orders.starts, fake.alerts.starts];

describe('E22.5 Assemble a dashboard feed from cold loaders, a shared ticker and filters', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('the loaders do not start until the feed is subscribed and each subscription starts each loader once (cold)', () => {
    const fake = createFakeSources();
    const feed = setUp(fake);
    const snapshot$ = feed.snapshot$;
    const live$ = feed.live(new Subject<OrderFilter>());
    const beforeSubscribe = startsOf(fake);

    snapshot$.subscribe();
    const afterOne = startsOf(fake);
    live$.subscribe();

    expect([beforeSubscribe, afterOne, startsOf(fake)]).toEqual([[0, 0, 0], [1, 1, 1], [2, 2, 2]]);
  });

  it('the initial snapshot waits for all three loaders (forkJoin) and fails as a whole when one fails (the error reaches the subscriber)', () => {
    const at = clock();
    const log: string[] = [];
    record(setUp(createFakeSources()).snapshot$, log);
    at(299);
    const beforeLast = [...log];
    at(300);

    expect(beforeLast).toEqual([]);
    expect(log).toEqual([
      '{"users":["ana","bo"],"orders":[{"id":1,"open":true},{"id":2,"open":false},{"id":3,"open":true}],"alerts":["disk"]}',
      'complete',
    ]);

    TestBed.resetTestingModule();
    const failing = createFakeSources({ failAlerts: true });
    const failed: string[] = [];
    record(setUp(failing).snapshot$, failed);
    at(450);

    expect(failed).toEqual(['error alerts down']);
    expect([failing.users.teardowns, failing.orders.teardowns, failing.alerts.teardowns]).toEqual([1, 1, 1]);
  });

  it('the live view combines the latest filter, the snapshot and the ticker (combineLatest), emits nothing until each has emitted, and startWith supplies the default filter', () => {
    const at = clock();
    const filter = new Subject<OrderFilter>();
    const log: string[] = [];
    record(setUp(createFakeSources()).live(filter), log, viewText);

    at(300);
    const snapshotOnly = [...log];
    at(1000);
    const firstTick = [...log];
    filter.next('open');
    at(2000);

    expect([snapshotOnly, firstTick]).toEqual([[], ['all:3@0']]);
    expect(log).toEqual(['all:3@0', 'open:2@0', 'open:2@1']);
  });

  it('two subscribers share one ticker run, and the ticker stops when the last subscriber leaves (share)', () => {
    const at = clock();
    const fake = createFakeSources();
    const feed = setUp(fake);
    const a: string[] = [];
    const b: string[] = [];
    const first = record(feed.live(new Subject<OrderFilter>()), a, viewText);
    const second = record(feed.live(new Subject<OrderFilter>()), b, viewText);
    at(2000);

    first.unsubscribe();
    const afterFirstLeft = [fake.ticker.starts, fake.ticker.teardowns];
    second.unsubscribe();

    expect(a).toEqual(['all:3@0', 'all:3@1']);
    expect(b).toEqual(a);
    expect(afterFirstLeft).toEqual([1, 0]);
    expect([fake.ticker.starts, fake.ticker.teardowns]).toEqual([1, 1]);
  });

  it('a click stream stamped with the latest ticker value (withLatestFrom) emits only on a click, never on a tick', () => {
    const at = clock();
    const clicks = new Subject<string>();
    const log: string[] = [];
    record(setUp(createFakeSources()).stamp(clicks), log);

    clicks.next('before any tick');
    at(1000);
    const afterTick = [...log];
    clicks.next('a');
    at(3000);
    clicks.next('b');

    expect(afterTick).toEqual([]);
    expect(log).toEqual(['["a",0]', '["b",2]']);
  });

  it('unsubscribing tears down every loader and the ticker (every teardown counter is 1)', () => {
    const at = clock();
    const fake = createFakeSources();
    const subscription = setUp(fake).live(new Subject<OrderFilter>()).subscribe();
    at(150);

    subscription.unsubscribe();

    expect([fake.users, fake.orders, fake.alerts, fake.ticker].map((counted) => counted.teardowns)).toEqual([1, 1, 1, 1]);
    expect(vi.getTimerCount()).toBe(0);
  });
});
