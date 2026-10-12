import { Observable, ReplaySubject, connect, defer, filter, interval, merge, of, share, shareReplay, take, tap, timer } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';

/** Subscribes `name` to `shared` and records `name + value + '@' + frame` for each value. */
function record(shared: Observable<number | string>, name: string, log: string[], now: () => number) {
  return shared.subscribe({
    next: (v) => log.push(`${name}${v}@${now()}`),
    error: (err: unknown) => log.push(`${name}E:${String(err)}@${now()}`),
    complete: () => log.push(`${name}C@${now()}`),
  });
}

describe('Section 5: multicasting in depth', () => {
  it('Section 5: shareReplay(1) keeps the source running and replays a stale value', () => {
    const run = framesRun((source) => source.pipe(shareReplay(1)));
    expect(run.ticksBefore10).toBe(9);
    expect(run.late).toEqual(['b8@10']);
    expect(run.subscriptions).toBe(1);
  });

  it('Section 5: shareReplay with refCount stops the source and starts fresh', () => {
    const run = framesRun((source) => source.pipe(shareReplay({ bufferSize: 1, refCount: true })));
    expect(run.ticksBefore10).toBe(2);
    expect(run.late).toEqual(['b0@11']);
    expect(run.subscriptions).toBe(2);
  });

  it('Section 5: shareReplay caches a completed source and retries an errored one', () => {
    for (const refCount of [false, true]) {
      const completed = lateSubscriber(['--r|'], (s) => s.pipe(shareReplay({ bufferSize: 1, refCount })));
      expect(completed.log).toEqual(['ar@2', 'aC@3', 'br@5', 'bC@5']);
      expect(completed.subscriptions).toBe(1);
    }
    const errored = lateSubscriber(['--#', '--r|'], (s) => s.pipe(shareReplay(1)));
    expect(errored.log).toEqual(['aE:error@2', 'br@7', 'bC@8']);
    expect(errored.subscriptions).toBe(2);
  });

  it('Section 5: share with a ReplaySubject connector and no resets replays after complete', () => {
    const run = lateSubscriber(['a-b-c|'], (s) =>
      s.pipe(
        share({
          connector: () => new ReplaySubject(1),
          resetOnError: false,
          resetOnComplete: false,
          resetOnRefCountZero: false,
        }),
      ),
      8,
    );
    expect(run.log).toEqual(['aa@0', 'ab@2', 'ac@4', 'aC@5', 'bc@8', 'bC@8']);
    expect(run.subscriptions).toBe(1);
  });

  it('Section 5: a reset notifier keeps the source for a grace period', () => {
    const log: string[] = [];
    let subscriptions = 0;
    const scheduler = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
    scheduler.run(() => {
      const prices = defer(() => {
        subscriptions++;
        return interval(1);
      }).pipe(share({ resetOnRefCountZero: () => timer(5) }));
      const now = () => scheduler.now();
      scheduler.schedule(() => record(prices.pipe(take(3)), 'a', log, now), 0);
      scheduler.schedule(() => record(prices.pipe(take(1)), 'b', log, now), 4);
      scheduler.schedule(() => record(prices.pipe(take(1)), 'c', log, now), 20);
    });
    expect(log).toEqual(['a0@1', 'a1@2', 'a2@3', 'aC@3', 'b3@4', 'bC@4', 'c0@21', 'cC@21']);
    expect(subscriptions).toBe(2);
  });

  it('Section 5: connect shares one subscription between two branches', () => {
    const run = (useConnect: boolean) => {
      const log: string[] = [];
      let subscriptions = 0;
      const scheduler = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
      scheduler.run(({ cold }) => {
        const source = defer(() => {
          subscriptions++;
          return cold('a-b-c|', { a: 1, b: 2, c: 3 });
        });
        const split = (s: Observable<number>) =>
          merge(
            s.pipe(filter((v) => v % 2 === 1)).pipe(tap((v) => log.push(`odd${v}@${scheduler.now()}`))),
            s.pipe(filter((v) => v % 2 === 0)).pipe(tap((v) => log.push(`even${v}@${scheduler.now()}`))),
          );
        const result = useConnect ? source.pipe(connect(split)) : split(source);
        result.subscribe({ complete: () => log.push(`C@${scheduler.now()}`) });
      });
      return { log, subscriptions };
    };
    expect(run(true)).toEqual({ log: ['odd1@0', 'even2@2', 'odd3@4', 'C@5'], subscriptions: 1 });
    expect(run(false).subscriptions).toBe(2);
  });

  it('Section 5: share re-runs a synchronous source for a second subscriber', () => {
    const twice = (operator: (s: Observable<number>) => Observable<number>) => {
      const log: string[] = [];
      const shared = of(1, 2, 3).pipe(operator);
      shared.subscribe((v) => log.push(`a${v}`));
      shared.subscribe((v) => log.push(`b${v}`));
      return log;
    };
    expect(twice((s) => s.pipe(share()))).toEqual(['a1', 'a2', 'a3', 'b1', 'b2', 'b3']);
    expect(twice((s) => s.pipe(shareReplay(2)))).toEqual(['a1', 'a2', 'a3', 'b2', 'b3']);
  });
});

/**
 * A subscriber `a` from frame 0 to 3 over a shared `interval(1)`, and a subscriber `b` arriving at frame 10 that
 * takes one value: returns the ticks before frame 10, `b`'s value with its frame, and the source subscriptions.
 */
function framesRun(operator: (source: Observable<number>) => Observable<number>) {
  const log: string[] = [];
  const tickFrames: number[] = [];
  let subscriptions = 0;
  const scheduler = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
  scheduler.run(() => {
    const now = () => scheduler.now();
    const shared = operator(
      defer(() => {
        subscriptions++;
        return interval(1).pipe(
          take(40),
          tap(() => tickFrames.push(now())),
        );
      }),
    );
    scheduler.schedule(() => {
      const a = record(shared, 'a', [], now);
      scheduler.schedule(() => a.unsubscribe(), 3);
    }, 0);
    scheduler.schedule(() => record(shared.pipe(take(1)), 'b', log, now), 10);
  });
  return {
    ticksBefore10: tickFrames.filter((f) => f < 10).length,
    late: log.filter((entry) => !entry.startsWith('bC')),
    subscriptions,
  };
}

/**
 * Subscriber `a` at frame 0 and `b` at `lateFrame` (default 5) to a shared cold source; subscription `n` plays
 * `runs[n - 1]` (the last entry repeats). Returns both subscribers' notifications and the source subscriptions.
 */
function lateSubscriber(
  runs: string[],
  operator: (source: Observable<string>) => Observable<string>,
  lateFrame = 5,
) {
  const log: string[] = [];
  let subscriptions = 0;
  const scheduler = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
  scheduler.run(({ cold }) => {
    const now = () => scheduler.now();
    const shared = operator(
      defer(() => {
        subscriptions++;
        const marbles = runs[Math.min(subscriptions, runs.length) - 1];
        return cold(marbles, { a: 'a', b: 'b', c: 'c', r: 'r' }, 'error');
      }),
    );
    scheduler.schedule(() => record(shared, 'a', log, now), 0);
    scheduler.schedule(() => record(shared, 'b', log, now), lateFrame);
  });
  return { log, subscriptions };
}
