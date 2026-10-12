// Each test reproduces one "Output" question from Module 23 and asserts the lines or frames its answer gives.
// A snippet's `console.log` is a recorded value here. If RxJS changes behaviour, this file fails first.
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { EnvironmentInjector, createEnvironmentInjector, signal } from '@angular/core';
import { rxResource, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { TestBed } from '@angular/core/testing';
import {
  BehaviorSubject,
  EMPTY,
  Observable,
  OperatorFunction,
  ReplaySubject,
  Subject,
  Subscriber,
  asapScheduler,
  asyncScheduler,
  catchError,
  concatMap,
  debounceTime,
  defer,
  delay,
  distinctUntilChanged,
  exhaustMap,
  finalize,
  interval,
  lastValueFrom,
  mergeMap,
  observeOn,
  of,
  queueScheduler,
  retry,
  share,
  scheduled,
  shareReplay,
  subscribeOn,
  switchMap,
  take,
  takeUntil,
  tap,
  throwError,
  timer,
  toArray,
} from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { TimelineEntry, timeline } from '../../22-rxjs-foundations/concepts/support/timeline';

type Flatten = (project: (value: string) => Observable<string>) => OperatorFunction<string, string>;

// Q23.02: the outer stream `a-b-----c---|` through one flattening operator; each outer value v maps to `--x--y|`
// (v1 at +2, v2 at +5, complete at +6). The log holds inner subscribe (`subv`), inner finalize (`finv`), values and `C`.
function flattenLog(flatten: Flatten): string[] {
  const log: string[] = [];
  const scheduler = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
  scheduler.run(({ cold }) => {
    const at = () => scheduler.now();
    const inner = (v: string) =>
      defer(() => {
        log.push(`sub${v}@${at()}`);
        return cold('--x--y|', { x: `${v}1`, y: `${v}2` });
      }).pipe(finalize(() => log.push(`fin${v}@${at()}`)));
    cold('a-b-----c---|')
      .pipe(flatten(inner))
      .subscribe({ next: (v) => log.push(`${v}@${at()}`), complete: () => log.push(`C@${at()}`) });
  });
  return log;
}

// Q23.11: the outer stream `a-b-c|`; each value maps to a request: `b` fails at once, the others answer `res-<value>`.
// `catchError` goes after `switchMap` ('outside') or inside the inner pipe ('inside'); `requested` lists the values
// that reached a request.
function catchPlacement(place: 'outside' | 'inside', fallback: () => Observable<string>) {
  const requested: string[] = [];
  const notifications = timeline(({ cold }) => {
    const request = (v: string) => {
      requested.push(v);
      return v === 'b' ? cold('#') : cold('x|', { x: `res-${v}` });
    };
    const outer = cold('a-b-c|');
    return place === 'outside'
      ? outer.pipe(switchMap(request), catchError(fallback))
      : outer.pipe(switchMap((v) => request(v).pipe(catchError(fallback))));
  });
  return { notifications, requested };
}

// Notifications as `value@frame`, `E@frame` and `C@frame`.
function show(entries: TimelineEntry[]): string {
  return entries.map(([frame, kind, value]) => (kind === 'N' ? `${value}@${frame}` : `${kind}@${frame}`)).join(' ');
}

// Q23.14: runs `pipeline` in virtual time over a source built by `defer`, so every subscription is recorded with
// its frame. Subscription number n uses the marbles `marblesFor(n)`; the error value is the string 'boom'.
function retryRun(marblesFor: (subscription: number) => string, pipeline: (source: Observable<string>) => Observable<string>) {
  const subscribedAt: number[] = [];
  const notifications: TimelineEntry[] = [];
  const scheduler = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
  scheduler.run(({ cold }) => {
    const source = defer(() => {
      subscribedAt.push(scheduler.now());
      return cold(marblesFor(subscribedAt.length), undefined, 'boom');
    });
    pipeline(source).subscribe({
      next: (value) => notifications.push([scheduler.now(), 'N', value]),
      error: () => notifications.push([scheduler.now(), 'E']),
      complete: () => notifications.push([scheduler.now(), 'C']),
    });
  });
  return { subscribedAt, notifications };
}

// Q23.17: `a` subscribes to the shared `interval(1)` at frame 0 and leaves at 3; `b` arrives at `lateFrame` and takes
// one value. Returns the source ticks before frame 10, `b`'s value with its frame and the source subscriptions.
// `take(40)` ends the source so that the virtual-time flush ends.
function leaverRun(operator: (source: Observable<number>) => Observable<number>, lateFrame = 10) {
  const ticks: number[] = [];
  const late: string[] = [];
  let subscriptions = 0;
  const scheduler = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
  scheduler.run(() => {
    const shared = operator(
      defer(() => {
        subscriptions++;
        return interval(1).pipe(
          take(40),
          tap(() => ticks.push(scheduler.now())),
        );
      }),
    );
    scheduler.schedule(() => {
      const a = shared.subscribe();
      scheduler.schedule(() => a.unsubscribe(), 3);
    }, 0);
    scheduler.schedule(() => shared.pipe(take(1)).subscribe((v) => late.push(`${v}@${scheduler.now()}`)), lateFrame);
  });
  return { ticksBefore10: ticks.filter((frame) => frame < 10).length, late, subscriptions };
}

// Q23.18: `a` subscribes at frame 0 and `b` at frame 5 to one shared cold source; subscription n of the source plays
// `runs[n - 1]` (the last entry repeats). Returns both subscribers' notifications and the source subscriptions.
function lateSubscriberRuns(runs: string[], operator: (source: Observable<string>) => Observable<string>) {
  const log: string[] = [];
  let subscriptions = 0;
  const scheduler = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
  scheduler.run(({ cold }) => {
    const shared = operator(
      defer(() => {
        subscriptions++;
        return cold(runs[Math.min(subscriptions, runs.length) - 1], { a: 'a', r: 'r' }, 'error');
      }),
    );
    const watch = (name: string) =>
      shared.subscribe({
        next: (v) => log.push(`${name}${v}@${scheduler.now()}`),
        error: (err: unknown) => log.push(`${name}E:${String(err)}@${scheduler.now()}`),
        complete: () => log.push(`${name}C@${scheduler.now()}`),
      });
    scheduler.schedule(() => watch('a'), 0);
    scheduler.schedule(() => watch('b'), 5);
  });
  return { log, subscriptions };
}

// Q23.21: `takeUntil(stop)` placed before or after `switchMap`. Each inner stream never ends by itself; `inners` keeps
// the subscribers so the run can finish the inner by hand after the notifier fired.
function stopRun(order: 'before' | 'after') {
  const log: string[] = [];
  const source = new Subject<number>();
  const stop = new Subject<void>();
  const inners: Subscriber<string>[] = [];
  const inner = (value: number) =>
    new Observable<string>((subscriber) => {
      inners.push(subscriber);
      log.push(`inner${value} subscribed`);
      return () => log.push(`inner${value} teardown`);
    });
  const pipeline =
    order === 'before' ? source.pipe(takeUntil(stop), switchMap(inner)) : source.pipe(switchMap(inner), takeUntil(stop));
  pipeline.subscribe({ next: (v) => log.push(v), complete: () => log.push('complete') });
  source.next(1);
  stop.next();
  const afterStop = [...log];
  inners[0].next('late');
  inners[0].complete();
  return { afterStop, sourceObserved: source.observed, afterInnerEnds: log.slice(afterStop.length) };
}

// Q23.24: four `toSignal` cases. `codeOf` keeps the NGxxxx code of an error message (or 'no error').
function codeOf(run: () => unknown): string {
  try {
    run();
    return 'no error';
  } catch (error) {
    return /NG\d{4}/.exec((error as Error).message)?.[0] ?? 'other';
  }
}

function toSignalCases() {
  vi.useFakeTimers();
  const sync = TestBed.runInInjectionContext(() => toSignal(new BehaviorSubject(1), { requireSync: true }))();
  const timerCode = codeOf(() => TestBed.runInInjectionContext(() => toSignal(timer(10), { requireSync: true })));
  const outsideCode = codeOf(() => toSignal(new BehaviorSubject(1)));

  const bound = new Subject<number>();
  const manual = new Subject<number>();
  const child = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));
  toSignal(bound, { injector: child });
  toSignal(manual, { injector: child, manualCleanup: true });
  child.destroy();
  const result = { sync, timerCode, outsideCode, boundObserved: bound.observed, manualObserved: manual.observed };
  manual.complete();
  return result;
}

// Q23.25: a signal set twice before the first effect run, read through `toObservable`. `seen` is copied at each step.
async function toObservableRun() {
  const count = signal(1);
  const seen: number[] = [];
  const stream = TestBed.runInInjectionContext(() => toObservable(count));
  stream.subscribe((value) => seen.push(value));

  count.set(2);
  count.set(3);
  const beforeTick = [...seen];
  TestBed.tick();
  const afterTick = [...seen];
  count.set(4);
  await Promise.resolve();
  const afterMicrotask = [...seen];
  TestBed.tick();
  const afterSecondTick = [...seen];
  const late: number[] = [];
  stream.subscribe((value) => late.push(value));
  return { beforeTick, afterTick, afterMicrotask, afterSecondTick, late };
}

// Q23.26: one `rxResource` whose stream is a `Subject` per `id`; `sub<id>` and `fin<id>` log each subscription and
// its teardown. `trace` holds `status:value` after each step; a step is one tick plus one microtask.
async function resourceRun() {
  const id = signal(1);
  const log: string[] = [];
  const trace: string[] = [];
  const sources = new Map<number, Subject<string>>();
  const resource = TestBed.runInInjectionContext(() =>
    rxResource({
      params: () => id(),
      stream: ({ params }) => {
        const source = new Subject<string>();
        sources.set(params, source);
        return new Observable<string>((subscriber) => {
          log.push(`sub${params}`);
          const inner = source.subscribe(subscriber);
          return () => {
            inner.unsubscribe();
            log.push(`fin${params}`);
          };
        });
      },
    }),
  );
  const step = async () => {
    TestBed.tick();
    await Promise.resolve();
    trace.push(`${resource.status()}:${String(resource.value())}`);
  };

  await step();
  sources.get(1)?.next('v1');
  await step();
  sources.get(1)?.next('v1b');
  await step();
  id.set(2);
  await step();
  sources.get(2)?.next('v2');
  await step();
  sources.get(2)?.error(new Error('bad'));
  await Promise.resolve();
  return { trace, log, status: resource.status(), error: (resource.error() as Error).message };
}

// Q23.26: a stream that completes without a value; the code is the `NGxxxx` of the stored error.
async function emptyResourceRun() {
  const resource = TestBed.runInInjectionContext(() => rxResource({ params: () => 1, stream: () => EMPTY }));
  TestBed.tick();
  await Promise.resolve();
  return { status: resource.status(), code: /NG\d{4}/.exec(String(resource.error()))?.[0] };
}

// Q23.27: the typeahead of section 8 over four keystrokes (`an`, `ang`, `angu`, `angu` again) and the term `err`,
// which the search rejects two frames after the request. A 3-frame debounce, a 4-frame search. `recover` says where
// `catchError` goes: inside the `switchMap` (per request) or after it (once, for the whole stream).
function typeaheadRun(recover: 'inside' | 'after') {
  return show(
    timeline(({ hot, cold }) => {
      const search = (term: string) =>
        term === 'err' ? cold('--#') : cold('----(r|)', { r: `R:${term}` });
      const terms = hot('a-b------c--------c-------x---|', { a: 'an', b: 'ang', c: 'angu', x: 'err' });
      const searched = terms.pipe(debounceTime(3), distinctUntilChanged());
      return recover === 'inside'
        ? searched.pipe(switchMap((term) => search(term).pipe(catchError(() => of('fallback')))))
        : searched.pipe(
            switchMap(search),
            catchError(() => of('dead')),
          );
    }),
  );
}

/** Q23.32: every way to defer a line, registered in this order; resolves with the lines once all have finished. */
async function schedulerOrder(): Promise<string[]> {
  const log: string[] = [];
  const track = (source: Observable<unknown>, line: string) =>
    new Promise<void>((resolve) => source.subscribe({ next: () => log.push(line), complete: () => resolve() }));
  const producer = new Observable<number>((subscriber) => {
    log.push('subscribeOn producer');
    subscriber.next(1);
    subscriber.complete();
  });
  log.push('start');
  const pending = [track(scheduled([1], asyncScheduler), 'async')];
  pending.push(track(scheduled([1], asapScheduler), 'asap'));
  pending.push(track(scheduled([1], queueScheduler), 'queue'));
  pending.push(track(of(1), 'sync'));
  pending.push(Promise.resolve().then(() => void log.push('promise')));
  pending.push(new Promise<void>((resolve) => setTimeout(() => resolve(void log.push('setTimeout0')), 0)));
  pending.push(track(of(1).pipe(observeOn(asyncScheduler)), 'observeOn async'));
  pending.push(track(producer.pipe(subscribeOn(asyncScheduler)), 'subscribeOn next'));
  log.push('end');
  await Promise.all(pending);
  return log;
}

/** Q23.35: marble assertions inside `run`; each `expect…` is compared when the callback ends, and a wrong marble throws. */
function marbleChecks(delayed = '10ms (a|)'): void {
  const scheduler = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
  scheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
    const source = hot('-a-^b-c|');
    expectObservable(source).toBe('-b-c|');
    expectSubscriptions(source.subscriptions).toBe('^---!');
    expectObservable(of(1, 2)).toBe('(ab|)', { a: 1, b: 2 });
    expectObservable(cold('a|').pipe(delay(10))).toBe(delayed);
    const first = cold('--x|');
    const second = cold('--x|');
    const inners = [first, second];
    expectObservable(hot('a-b----|').pipe(switchMap((_, index) => inners[index]))).toBe('----x--|');
    expectSubscriptions(first.subscriptions).toBe('^-!');
    expectSubscriptions(second.subscriptions).toBe('--^--!');
  });
}

describe('Module 23 Output questions', () => {
  afterEach(() => vi.useRealTimers());

  it('Q23.02 the four flattening operators give four different frame lines for one outer stream, and mergeMap with a limit of 1 gives the concatMap values', () => {
    expect(flattenLog((p) => switchMap(p)).join(' ')).toBe(
      'suba@0 fina@2 subb@2 b1@4 b2@7 finb@8 subc@8 c1@10 c2@13 C@14 finc@14',
    );
    expect(flattenLog((p) => mergeMap(p)).join(' ')).toBe(
      'suba@0 subb@2 a1@2 b1@4 a2@5 fina@6 b2@7 subc@8 finb@8 c1@10 c2@13 finc@14 C@14',
    );
    expect(flattenLog((p) => concatMap(p)).join(' ')).toBe(
      'suba@0 a1@2 a2@5 fina@6 subb@6 b1@8 b2@11 finb@12 subc@12 c1@14 c2@17 finc@18 C@18',
    );
    expect(flattenLog((p) => exhaustMap(p)).join(' ')).toBe('suba@0 a1@2 a2@5 fina@6 subc@8 c1@10 c2@13 C@14 finc@14');

    // Follow-ups: a limit of 1 is concatMap, and a limit of 2 makes the third value wait for a slot.
    const values = (log: string[]) => log.filter((entry) => !entry.startsWith('sub') && !entry.startsWith('fin'));
    expect(values(flattenLog((p) => mergeMap(p, 1))).join(' ')).toBe('a1@2 a2@5 b1@8 b2@11 c1@14 c2@17 C@18');
    expect(timeline(({ cold }) => cold('abc|').pipe(mergeMap((v) => cold('---x|', { x: v }), 2)))).toEqual([
      [3, 'N', 'a'],
      [4, 'N', 'b'],
      [7, 'N', 'c'],
      [8, 'C'],
    ]);
  });

  it('Q23.04 over a synchronous source switchMap delivers only the last Promise result, and mergeMap, concatMap and exhaustMap deliver every result or the first', async () => {
    const tenTimes = (value: number) => Promise.resolve(value * 10);
    expect(await lastValueFrom(of(1, 2, 3).pipe(switchMap(tenTimes), toArray()))).toEqual([30]);
    expect(await lastValueFrom(of(1, 2, 3).pipe(mergeMap(tenTimes), toArray()))).toEqual([10, 20, 30]);

    // Follow-ups: concatMap queues the Promises, exhaustMap keeps the first and ignores the other two.
    expect(await lastValueFrom(of(1, 2, 3).pipe(concatMap(tenTimes), toArray()))).toEqual([10, 20, 30]);
    expect(await lastValueFrom(of(1, 2, 3).pipe(exhaustMap(tenTimes), toArray()))).toEqual([10]);
  });

  it('Q23.07 two searches through switchMap make two requests, the testing backend reports cancelled true then false, and only the second response arrives', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const http = TestBed.inject(HttpClient);
    const controller = TestBed.inject(HttpTestingController);
    const terms = new Subject<string>();
    const results: string[] = [];

    terms.pipe(switchMap((term) => http.get<string>(`/s?q=${term}`))).subscribe((result) => results.push(result));
    terms.next('a');
    terms.next('ab');

    const requests = controller.match(() => true);
    expect(requests.map((r) => r.request.urlWithParams)).toEqual(['/s?q=a', '/s?q=ab']);
    expect(requests.map((r) => r.cancelled)).toEqual([true, false]);

    // Follow-up: the testing backend refuses to answer the request that switchMap unsubscribed.
    expect(() => requests[0].flush('R-a')).toThrow('Cannot flush a cancelled request.');
    requests[1].flush('R-ab');
    expect(results).toEqual(['R-ab']);
    controller.verify();
  });
  it('Q23.11 catchError after switchMap ends the whole stream with the fallback, and catchError inside the inner pipe replaces only the failed request', () => {
    const outside = catchPlacement('outside', () => of('fallback'));
    expect(show(outside.notifications)).toBe('res-a@0 fallback@2 C@2');
    expect(outside.requested).toEqual(['a', 'b']);

    const inside = catchPlacement('inside', () => of('fallback'));
    expect(show(inside.notifications)).toBe('res-a@0 fallback@2 res-c@4 C@5');
    expect(inside.requested).toEqual(['a', 'b', 'c']);

    // Follow-up: the same placement with EMPTY gives no fallback value, and inside it still reaches `c`.
    expect(show(catchPlacement('outside', () => EMPTY).notifications)).toBe('res-a@0 C@2');
    expect(show(catchPlacement('inside', () => EMPTY).notifications)).toBe('res-a@0 res-c@4 C@5');
  });

  it('Q23.12 finalize runs after the complete handler and after the source teardown, on complete, on error and on unsubscribe', () => {
    const log: string[] = [];
    of(1)
      .pipe(
        finalize(() => log.push('fin1')),
        finalize(() => log.push('fin2')),
      )
      .subscribe({ next: (v) => log.push(`next ${v}`), complete: () => log.push('complete') });
    expect(log.join(', ')).toBe('next 1, complete, fin1, fin2');

    log.length = 0;
    throwError(() => new Error('x'))
      .pipe(finalize(() => log.push('fin')))
      .subscribe({ error: () => log.push('error') });
    expect(log.join(', ')).toBe('error, fin');

    log.length = 0;
    new Observable<number>(() => () => log.push('teardown'))
      .pipe(finalize(() => log.push('fin')))
      .subscribe()
      .unsubscribe();
    expect(log.join(', ')).toBe('teardown, fin');

    log.length = 0;
    new Observable<number>((subscriber) => {
      subscriber.complete();
      return () => log.push('src teardown');
    })
      .pipe(finalize(() => log.push('fin')))
      .subscribe({ complete: () => log.push('complete') });
    expect(log.join(', ')).toBe('complete, src teardown, fin');

    // Follow-up: an unsubscribe after the complete does not run the callback a second time.
    log.length = 0;
    of(1)
      .pipe(finalize(() => log.push('fin')))
      .subscribe()
      .unsubscribe();
    expect(log).toEqual(['fin']);
  });

  it('Q23.14 retry(2) subscribes three times and errors at frame 3, an exponential delay retries at 2, 6 and 14, and resetOnSuccess lets five subscriptions reach the success', () => {
    const plain = retryRun(() => 'a#', (s) => s.pipe(retry(2)));
    expect(plain.subscribedAt).toEqual([0, 1, 2]);
    expect(show(plain.notifications)).toBe('a@0 a@1 a@2 E@3');

    const backoff = retryRun(
      () => '#',
      (s) => s.pipe(retry({ count: 3, delay: (_err, n) => timer(2 ** n) })),
    );
    expect(backoff.subscribedAt).toEqual([0, 2, 6, 14]);
    expect(show(backoff.notifications)).toBe('E@14');

    const failFourTimes = (n: number) => (n <= 4 ? 'a#' : 'b|');
    const budget = retryRun(failFourTimes, (s) => s.pipe(retry({ count: 2 })));
    expect(budget.subscribedAt.length).toBe(3);
    expect(show(budget.notifications)).toBe('a@0 a@1 a@2 E@3');
    const reset = retryRun(failFourTimes, (s) => s.pipe(retry({ count: 2, resetOnSuccess: true })));
    expect(reset.subscribedAt.length).toBe(5);
    expect(show(reset.notifications)).toBe('a@0 a@1 a@2 a@3 b@4 C@5');

    // Follow-up: a number delay waits the same time before every retry.
    const fixed = retryRun(() => '#', (s) => s.pipe(retry({ count: 2, delay: 5 })));
    expect(fixed.subscribedAt).toEqual([0, 5, 10]);
    expect(show(fixed.notifications)).toBe('E@10');
  });

  it('Q23.17 shareReplay(1) keeps the interval running and hands the late subscriber a stale value, and refCount true stops it and starts a fresh run', () => {
    expect(leaverRun((s) => s.pipe(shareReplay(1)))).toEqual({ ticksBefore10: 9, late: ['8@10'], subscriptions: 1 });
    expect(leaverRun((s) => s.pipe(shareReplay({ bufferSize: 1, refCount: true })))).toEqual({
      ticksBefore10: 2,
      late: ['0@11'],
      subscriptions: 2,
    });

    // Follow-ups: share() resets at zero like refCount true, and a grace period keeps the run for a subscriber that returns in time.
    expect(leaverRun((s) => s.pipe(share()))).toEqual({ ticksBefore10: 2, late: ['0@11'], subscriptions: 2 });
    const warm = (s: Observable<number>) =>
      s.pipe(share({ connector: () => new ReplaySubject<number>(1), resetOnRefCountZero: () => timer(5) }));
    const inTime = leaverRun(warm, 6);
    expect([inTime.late, inTime.subscriptions]).toEqual([['4@6'], 1]);
    const tooLate = leaverRun(warm, 10);
    expect([tooLate.late, tooLate.subscriptions]).toEqual([['0@11'], 2]);
  });

  it('Q23.18 shareReplay keeps a completed source for a late subscriber and starts a new run after an error', () => {
    for (const refCount of [false, true]) {
      const completed = lateSubscriberRuns(['--r|'], (s) => s.pipe(shareReplay({ bufferSize: 1, refCount })));
      expect(completed.log).toEqual(['ar@2', 'aC@3', 'br@5', 'bC@5']);
      expect(completed.subscriptions).toBe(1);
    }
    const errored = lateSubscriberRuns(['--#', '--r|'], (s) => s.pipe(shareReplay(1)));
    expect(errored.log).toEqual(['aE:error@2', 'br@7', 'bC@8']);
    expect(errored.subscriptions).toBe(2);

    // Follow-ups: share() resets on complete too, and the buffer of an errored run is not replayed.
    const plainShare = lateSubscriberRuns(['--r|'], (s) => s.pipe(share()));
    expect(plainShare.log).toEqual(['ar@2', 'aC@3', 'br@7', 'bC@8']);
    expect(plainShare.subscriptions).toBe(2);
    const afterValue = lateSubscriberRuns(['a-#', '--r|'], (s) => s.pipe(shareReplay(1)));
    expect(afterValue.log).toEqual(['aa@0', 'aE:error@2', 'br@7', 'bC@8']);
    expect(afterValue.subscriptions).toBe(2);
  });

  it('Q23.21 takeUntil before switchMap leaves the inner stream running after the notifier, and takeUntil after it completes the result and tears the inner down', () => {
    const before = stopRun('before');
    expect(before.afterStop).toEqual(['inner1 subscribed']);
    expect(before.sourceObserved).toBe(false);
    expect(before.afterInnerEnds).toEqual(['late', 'complete', 'inner1 teardown']);

    const after = stopRun('after');
    expect(after.afterStop).toEqual(['inner1 subscribed', 'complete', 'inner1 teardown']);
    expect(after.sourceObserved).toBe(false);
    expect(after.afterInnerEnds).toEqual([]);
  });

  it('Q23.24 requireSync accepts a BehaviorSubject and throws NG0601 for a timer, a call outside an injection context throws NG0203, and manualCleanup outlives the injector', () => {
    expect(toSignalCases()).toEqual({
      sync: 1,
      timerCode: 'NG0601',
      outsideCode: 'NG0203',
      boundObserved: false,
      manualObserved: true,
    });
  });

  it('Q23.25 a toObservable subscriber sees nothing before TestBed.tick(), then one emission of the last write, and a late subscriber gets the replayed value', async () => {
    expect(await toObservableRun()).toEqual({
      beforeTick: [],
      afterTick: [3],
      afterMicrotask: [3],
      afterSecondTick: [3, 4],
      late: [4],
    });
  });

  it('Q23.26 rxResource shows loading with an undefined value after a params change, finalizes the first stream, reports the error state, and an empty stream is NG0991', async () => {
    expect(await resourceRun()).toEqual({
      trace: ['loading:undefined', 'resolved:v1', 'resolved:v1b', 'loading:undefined', 'resolved:v2'],
      log: ['sub1', 'fin1', 'sub2', 'fin2'],
      status: 'error',
      error: 'bad',
    });
    expect(await emptyResourceRun()).toEqual({ status: 'error', code: 'NG0991' });
  });

  it('Q23.27 the typeahead emits R:ang at 9, R:angu at 16 and fallback at 31, and with catchError after switchMap the failure at 31 ends the stream', () => {
    expect(typeaheadRun('inside')).toBe('R:ang@9 R:angu@16 fallback@31 C@31');
    expect(typeaheadRun('after')).toBe('R:ang@9 R:angu@16 dead@31 C@31');
  });

  it('Q23.32 the lines print start, queue, sync, end, asap, promise, async, setTimeout0, observeOn async, subscribeOn producer and subscribeOn next', async () => {
    expect(await schedulerOrder()).toEqual([
      'start',
      'queue',
      'sync',
      'end',
      'asap',
      'promise',
      'async',
      'setTimeout0',
      'observeOn async',
      'subscribeOn producer',
      'subscribeOn next',
    ]);
  });

  it('Q23.35 the marble assertions pass with the hot caret, the sync group, 10ms (a|) and the switchMap subscription marbles, and 10ms a| throws', () => {
    expect(() => marbleChecks()).not.toThrow();
    expect(() => marbleChecks('10ms a|')).toThrow();
  });
});
