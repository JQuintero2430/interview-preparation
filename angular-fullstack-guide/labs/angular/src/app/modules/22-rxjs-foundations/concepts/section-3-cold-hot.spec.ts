import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  Observable,
  Subject,
  bufferCount,
  connectable,
  defer,
  from,
  fromEvent,
  interval,
  multicast,
  range,
  refCount,
  share,
} from 'rxjs';

describe('Section 3: cold and hot, unicast and multicast', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('Section 3: interval is cold, each subscriber gets its own timer', () => {
    vi.useFakeTimers();
    const first: number[] = [];
    const second: number[] = [];
    const ticks = interval(10);

    const a = ticks.subscribe((n) => first.push(n));
    vi.advanceTimersByTime(20);
    const b = ticks.subscribe((n) => second.push(n));
    vi.advanceTimersByTime(20);
    a.unsubscribe();
    b.unsubscribe();

    expect(first).toEqual([0, 1, 2, 3]);
    expect(second).toEqual([0, 1]);
  });

  it('Section 3: fromEvent adds a listener per subscription and misses earlier events', () => {
    const button = document.createElement('button');
    const add = vi.spyOn(button, 'addEventListener');
    const remove = vi.spyOn(button, 'removeEventListener');
    const clicks = fromEvent(button, 'click');
    const seen: string[] = [];

    button.click();
    const s1 = clicks.subscribe(() => seen.push('s1'));
    const s2 = clicks.subscribe(() => seen.push('s2'));

    expect(seen).toEqual([]);
    expect(add).toHaveBeenCalledTimes(2);

    button.click();
    s1.unsubscribe();
    button.click();
    s2.unsubscribe();

    expect(seen).toEqual(['s1', 's2', 's2']);
    expect(remove).toHaveBeenCalledTimes(2);

    add.mockClear();
    const shared = clicks.pipe(share());
    const t1 = shared.subscribe();
    const t2 = shared.subscribe();

    expect(add).toHaveBeenCalledTimes(1);
    t1.unsubscribe();
    t2.unsubscribe();
  });

  it('Section 3: from(promise) shares one promise and defer re-runs the factory', async () => {
    let runs = 0;
    const make = (): Promise<number> => Promise.resolve(++runs);
    const log: string[] = [];

    const eager = from(make());

    expect(runs).toBe(1);

    eager.subscribe((v) => log.push(`a${v}`));
    eager.subscribe((v) => log.push(`b${v}`));
    const lazy = defer(() => from(make()));
    lazy.subscribe((v) => log.push(`c${v}`));
    lazy.subscribe((v) => log.push(`d${v}`));
    await Promise.resolve();

    expect(log).toEqual(['a1', 'b1', 'c2', 'd3']);
    expect(runs).toBe(3);
  });

  it('Section 3: share runs one producer and resets when the last subscriber leaves', () => {
    const log: string[] = [];
    let runs = 0;
    const source = new Observable<string>((subscriber) => {
      runs++;
      const run = runs;
      log.push(`producer ${run}`);
      subscriber.next('x');
      return () => log.push(`teardown ${run}`);
    });
    const shared = source.pipe(share());

    const a = shared.subscribe((v) => log.push(`1:${v}`));
    const b = shared.subscribe((v) => log.push(`2:${v}`));
    a.unsubscribe();

    expect(log).toEqual(['producer 1', '1:x']);

    b.unsubscribe();
    const c = shared.subscribe((v) => log.push(`3:${v}`));

    expect(log).toEqual(['producer 1', '1:x', 'teardown 1', 'producer 2', '3:x']);

    c.unsubscribe();

    expect(runs).toBe(2);
  });

  it('Section 3: a late subscriber of a shared stream misses earlier values', () => {
    const source = new Subject<number>();
    const shared = source.pipe(share());
    const early: number[] = [];
    const late: number[] = [];

    shared.subscribe((v) => early.push(v));
    source.next(1);
    shared.subscribe((v) => late.push(v));
    source.next(2);

    expect(early).toEqual([1, 2]);
    expect(late).toEqual([2]);
  });

  it('Section 3: connectable runs nothing until connect', () => {
    let runs = 0;
    const source = new Observable<number>((subscriber) => {
      runs++;
      subscriber.next(1);
      subscriber.next(2);
    });
    const hot = connectable(source);
    const log: string[] = [];

    hot.subscribe((v) => log.push(`a${v}`));

    expect(runs).toBe(0);

    hot.connect();
    hot.subscribe((v) => log.push(`b${v}`));

    expect(runs).toBe(1);
    expect(log).toEqual(['a1', 'a2']);
  });

  it('Section 3: a producer pushes every value without waiting for the consumer', () => {
    let delivered = 0;
    const sub = range(1, 1000).subscribe(() => delivered++);

    expect(delivered).toBe(1000);
    expect('request' in sub).toBe(false);

    const batches: number[][] = [];
    range(1, 1000)
      .pipe(bufferCount(100))
      .subscribe((batch) => batches.push(batch));

    expect(batches).toHaveLength(10);
  });

  it('Section 3: multicast with refCount and share each run one producer for two subscribers', () => {
    const producers: string[] = [];
    const source = (name: string): Observable<number> =>
      new Observable<number>((subscriber) => {
        producers.push(name);
        subscriber.next(1);
      });
    const legacy = source('legacy').pipe(
      multicast(() => new Subject<number>()),
      refCount(),
    );
    const current = source('current').pipe(share());

    for (const stream of [legacy, current]) {
      const open = [stream.subscribe(), stream.subscribe()];
      open.forEach((s) => s.unsubscribe());
    }

    expect(producers).toEqual(['legacy', 'current']);
  });

  it('Section 3: HttpClient sends no request until subscribe and one per subscribe', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const request$ = TestBed.inject(HttpClient).get('/lab-m22/items');
    const controller = TestBed.inject(HttpTestingController);

    controller.expectNone('/lab-m22/items');
    request$.subscribe();
    request$.subscribe();

    expect(controller.match('/lab-m22/items')).toHaveLength(2);
  });
});
