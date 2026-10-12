import { Observable, Subject, Subscriber, Subscription, config, defer, filter, map, of, share, take } from 'rxjs';

describe('Section 9: under the hood', () => {
  afterEach(() => {
    config.onUnhandledError = null;
    vi.useRealTimers();
  });

  it('Section 9: subscribe returns a Subscriber that is a Subscription', () => {
    const sub = of(1).subscribe();

    expect(sub).toBeInstanceOf(Subscriber);
    expect(sub).toBeInstanceOf(Subscription);
    expect(sub.constructor.name).toBe('SafeSubscriber');
    expect(sub.closed).toBe(true);
  });

  it('Section 9: unsubscribing downstream runs the source teardown through every operator', () => {
    let teardowns = 0;
    let producerSide: Subscriber<number> | undefined;
    const source = new Observable<number>((subscriber) => {
      producerSide = subscriber;
      return () => teardowns++;
    });
    const out: number[] = [];

    const sub = source.pipe(map((v) => v * 10), filter((v) => v > 0), take(5)).subscribe((v) => out.push(v));
    producerSide?.next(1);
    const openBefore = producerSide?.closed;
    sub.unsubscribe();

    expect(out).toEqual([10]);
    expect(openBefore).toBe(false);
    expect(producerSide?.closed).toBe(true);
    expect(teardowns).toBe(1);
  });

  it('Section 9: a throw in an operator reaches error and a throw in a consumer handler is reported later', () => {
    vi.useFakeTimers();
    const reported: string[] = [];
    config.onUnhandledError = (err: Error) => reported.push(err.message);
    const log: string[] = [];

    of(1)
      .pipe(
        map((): number => {
          throw new Error('in map');
        }),
      )
      .subscribe({ error: (err: Error) => log.push(`error handler: ${err.message}`) });
    of(1).subscribe({
      next: () => {
        throw new Error('in next');
      },
      error: () => log.push('never'),
    });
    log.push('after subscribe');
    const reportedBeforeTimers = [...reported];
    vi.runAllTimers();

    expect(log).toEqual(['error handler: in map', 'after subscribe']);
    expect(reportedBeforeTimers).toEqual([]);
    expect(reported).toEqual(['in next']);
  });

  it('Section 9: a subject delivers to a copy of its observers', () => {
    const subject = new Subject<number>();
    const log: string[] = [];
    let peer: Subscription | undefined;

    subject.subscribe((v) => {
      log.push(`A${v}`);
      if (v === 1) {
        subject.subscribe((w) => log.push(`late${w}`));
        peer?.unsubscribe();
      }
    });
    peer = subject.subscribe((v) => log.push(`B${v}`));
    subject.next(1);
    subject.next(2);

    expect(log).toEqual(['A1', 'A2', 'late2']);
  });

  it('Section 9: share resets its subject when the last subscriber leaves', () => {
    let runs = 0;
    let teardowns = 0;
    const shared = new Observable<number>((subscriber) => {
      runs++;
      subscriber.next(runs);
      return () => teardowns++;
    }).pipe(share());
    const log: string[] = [];

    const a = shared.subscribe((v) => log.push(`a${v}`));
    const b = shared.subscribe((v) => log.push(`b${v}`));
    a.unsubscribe();
    const teardownsWithOneLeft = teardowns;
    b.unsubscribe();
    shared.subscribe((v) => log.push(`c${v}`));

    expect(teardownsWithOneLeft).toBe(0);
    expect(teardowns).toBe(1);
    expect(runs).toBe(2);
    expect(log).toEqual(['a1', 'c2']);

    let completedRuns = 0;
    const completing = defer(() => {
      completedRuns++;
      return of('x');
    }).pipe(share());
    completing.subscribe();
    completing.subscribe();

    expect(completedRuns).toBe(2);
  });
});
