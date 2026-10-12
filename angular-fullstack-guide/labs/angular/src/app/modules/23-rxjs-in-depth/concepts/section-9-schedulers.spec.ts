import {
  Observable,
  animationFrameScheduler,
  asapScheduler,
  asyncScheduler,
  delay,
  lastValueFrom,
  mergeAll,
  observeOn,
  of,
  queueScheduler,
  scheduled,
  subscribeOn,
} from 'rxjs';
import {
  legacyFromWithScheduler,
  legacyMergeWithScheduler,
  legacyOfWithScheduler,
} from '../legacy/deprecated-forms';

/** A producer that logs its start, emits `1` and logs the line after `next`, then completes. */
function producer(log: string[]): Observable<number> {
  return new Observable<number>((subscriber) => {
    log.push('producer');
    subscriber.next(1);
    log.push('producer after next');
    subscriber.complete();
  });
}

/** Subscribes, logs what is delivered and resolves when the stream completes. */
function run(log: string[], source: Observable<unknown>): Promise<void> {
  return new Promise<void>((resolve) => {
    source.subscribe({ next: (value) => log.push(`next ${value}`), complete: () => resolve() });
    log.push('subscribe returned');
  });
}

describe('Section 9: schedulers', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('Section 9: schedulers run in the order sync, queue, asap, async', async () => {
    const log: string[] = [];
    log.push('start');
    const asyncDone = lastValueFrom(scheduled([1], asyncScheduler)).then(() => log.push('async'));
    scheduled([1], asapScheduler).subscribe(() => log.push('asap'));
    of(1).subscribe(() => log.push('sync'));
    scheduled([1], queueScheduler).subscribe(() => log.push('queue'));
    log.push('end');
    await asyncDone;
    expect(log).toEqual(['start', 'sync', 'queue', 'end', 'asap', 'async']);
  });

  it('Section 9: queueScheduler trampolines nested work', () => {
    const queued: string[] = [];
    queueScheduler.schedule(() => {
      queued.push('outer');
      queueScheduler.schedule(() => queued.push('inner'));
      queued.push('outer-after-schedule');
    });
    queued.push('after');
    expect(queued).toEqual(['outer', 'outer-after-schedule', 'inner', 'after']);

    const direct: string[] = [];
    const outer = () => {
      direct.push('outer');
      (() => direct.push('inner'))();
      direct.push('outer-after-call');
    };
    outer();
    direct.push('after');
    expect(direct).toEqual(['outer', 'inner', 'outer-after-call', 'after']);
  });

  it('Section 9: asap actions queued around a promise run in one microtask', async () => {
    const log: string[] = [];
    asapScheduler.schedule(() => log.push('asap1'));
    const promise = Promise.resolve().then(() => log.push('promise1'));
    asapScheduler.schedule(() => log.push('asap2'));
    await promise;
    expect(log).toEqual(['asap1', 'asap2', 'promise1']);
  });

  it('Section 9: asyncScheduler uses a timer even with delay 0', () => {
    vi.useFakeTimers();
    const log: string[] = [];
    asyncScheduler.schedule(() => log.push('async'), 0);
    expect(log).toEqual([]);
    expect(vi.getTimerCount()).toBe(1);
    vi.advanceTimersByTime(1);
    expect(log).toEqual(['async']);
    expect(vi.getTimerCount()).toBe(0);

    asapScheduler.schedule(() => log.push('asap'));
    expect(vi.getTimerCount()).toBe(0);

    const delayed = of(1).pipe(delay(100)).subscribe();
    expect(vi.getTimerCount()).toBe(1);
    delayed.unsubscribe();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('Section 9: observeOn delays delivery and subscribeOn delays the producer', async () => {
    const delivery: string[] = [];
    await run(delivery, producer(delivery).pipe(observeOn(asyncScheduler)));
    expect(delivery).toEqual(['producer', 'producer after next', 'subscribe returned', 'next 1']);

    const start: string[] = [];
    await run(start, producer(start).pipe(subscribeOn(asyncScheduler)));
    expect(start).toEqual(['subscribe returned', 'producer', 'next 1', 'producer after next']);
  });

  it('Section 9: animationFrameScheduler runs on requestAnimationFrame', async () => {
    const frame = vi.spyOn(globalThis, 'requestAnimationFrame');
    const log: string[] = [];
    const frameDone = lastValueFrom(scheduled([1], animationFrameScheduler)).then(() => log.push('frame'));
    const asyncDone = lastValueFrom(scheduled([1], asyncScheduler)).then(() => log.push('async'));
    expect(frame).toHaveBeenCalledTimes(1);
    expect(log).toEqual([]);
    await Promise.all([frameDone, asyncDone]);
    expect(log).toEqual(['async', 'frame']);
  });

  it('Section 9: scheduled replaces the scheduler argument', async () => {
    const forms: Record<string, () => Observable<number>> = {
      legacy: () => legacyOfWithScheduler(asapScheduler),
      scheduled: () => scheduled([1, 2], asapScheduler),
      observeOn: () => of(1, 2).pipe(observeOn(asapScheduler)),
    };
    for (const name of Object.keys(forms)) {
      const log: string[] = [];
      await run(log, forms[name]());
      expect(log, name).toEqual(['subscribe returned', 'next 1', 'next 2']);
    }
  });

  it('Section 9: the legacy scheduler arguments match scheduled and observeOn', async () => {
    const collect = async (source: Observable<number>) => {
      const log: string[] = [];
      await run(log, source);
      return log;
    };
    const expected = ['subscribe returned', 'next 1', 'next 2'];
    expect(await collect(legacyFromWithScheduler([1, 2], asapScheduler))).toEqual(expected);
    expect(await collect(scheduled([1, 2], asapScheduler))).toEqual(expected);

    const merged = ['subscribe returned', 'next 1', 'next 2', 'next 3', 'next 4'];
    expect(await collect(legacyMergeWithScheduler(of(1, 2), of(3, 4), asapScheduler))).toEqual(merged);
    expect(await collect(scheduled([of(1, 2), of(3, 4)], asapScheduler).pipe(mergeAll()))).toEqual(merged);
  });
});
