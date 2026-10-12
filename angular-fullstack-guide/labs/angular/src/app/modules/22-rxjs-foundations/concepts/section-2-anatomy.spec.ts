import { Observable, Subscriber, Subscription, UnsubscriptionError, config, map, of, take, throwError } from 'rxjs';

// --- A source the test ends by hand: it keeps the subscriber the producer received and logs its teardown ---

function heldSource(log: string[]): { source: Observable<number>; subscriber: () => Subscriber<number> } {
  let held: Subscriber<number> | undefined;
  const source = new Observable<number>((subscriber) => {
    held = subscriber;
    return () => log.push('teardown');
  });
  return { source, subscriber: () => held as Subscriber<number> };
}

describe('Section 2: anatomy', () => {
  afterEach(() => {
    vi.useRealTimers();
    config.onUnhandledError = null;
  });

  it('Section 2: teardown runs on complete, on error and on unsubscribe, once', () => {
    const onComplete: string[] = [];
    const completing = heldSource(onComplete);
    const done = completing.source.subscribe({ complete: () => onComplete.push(`complete, closed ${done.closed}`) });
    completing.subscriber().complete();
    onComplete.push(`closed ${done.closed}`);

    expect(onComplete).toEqual(['complete, closed false', 'teardown', 'closed true']);

    const onError: string[] = [];
    const failing = heldSource(onError);
    failing.source.subscribe({ error: () => onError.push('error') });
    failing.subscriber().error(new Error('x'));

    expect(onError).toEqual(['error', 'teardown']);

    const onUnsubscribe: string[] = [];
    const leaving = heldSource(onUnsubscribe);
    const sub = leaving.source.subscribe();
    sub.unsubscribe();
    sub.unsubscribe();

    expect(onUnsubscribe).toEqual(['teardown']);
    expect(sub.closed).toBe(true);
  });

  it('Section 2: a synchronous complete runs the teardown after the producer returns', () => {
    const log: string[] = [];
    new Observable<number>((subscriber) => {
      subscriber.next(1);
      subscriber.complete();
      log.push('producer returns');
      return () => log.push('teardown');
    }).subscribe({ next: () => log.push('n'), complete: () => log.push('c') });

    expect(log).toEqual(['n', 'c', 'producer returns', 'teardown']);
  });

  it('Section 2: notifications after complete or error are ignored', () => {
    const afterComplete: string[] = [];
    new Observable<number>((subscriber) => {
      subscriber.next(1);
      subscriber.complete();
      subscriber.next(2);
      subscriber.complete();
      subscriber.error(new Error('late'));
    }).subscribe({ next: (v) => afterComplete.push(`n${v}`), error: () => afterComplete.push('e'), complete: () => afterComplete.push('c') });

    expect(afterComplete).toEqual(['n1', 'c']);

    const afterError: string[] = [];
    new Observable<number>((subscriber) => {
      subscriber.next(1);
      subscriber.error(new Error('first'));
      subscriber.next(2);
      subscriber.complete();
    }).subscribe({ next: (v) => afterError.push(`n${v}`), error: () => afterError.push('e'), complete: () => afterError.push('c') });

    expect(afterError).toEqual(['n1', 'e']);
  });

  it('Section 2: take closes a synchronous producer and the loop sees closed', () => {
    let next = 0;
    const log: Array<number | string> = [];
    new Observable<number>((subscriber) => {
      while (!subscriber.closed) {
        subscriber.next(next++);
      }
      return () => log.push('teardown');
    })
      .pipe(take(3))
      .subscribe({ next: (v) => log.push(v), complete: () => log.push('c') });

    expect(log).toEqual([0, 1, 2, 'c', 'teardown']);
    expect(next).toBe(3);
  });

  it('Section 2: an error thrown in next is reported later, not at subscribe', () => {
    vi.useFakeTimers();
    const reported: string[] = [];
    config.onUnhandledError = (err: unknown) => reported.push((err as Error).message);

    of(1).subscribe({
      next: () => {
        throw new Error('handler threw');
      },
    });
    throwError(() => new Error('no error handler')).subscribe();

    expect(reported).toEqual([]);

    vi.runAllTimers();

    expect(reported).toEqual(['handler threw', 'no error handler']);
  });

  it('Section 2: unsubscribing from inside next of a synchronous source reaches an unassigned variable', () => {
    vi.useFakeTimers();
    const reported: unknown[] = [];
    config.onUnhandledError = (err: unknown) => reported.push(err);

    const sub = of(1).subscribe(() => sub.unsubscribe());

    expect(reported).toEqual([]);

    vi.runAllTimers();

    expect(reported).toHaveLength(1);
    expect((reported[0] as Error).name).toBe('ReferenceError');
  });

  it('Section 2: a producer that throws delivers an error notification', () => {
    const log: string[] = [];
    new Observable<number>(() => {
      throw new Error('producer');
    }).subscribe({ error: (err: Error) => log.push(`E:${err.message}`) });
    of(1, 2, 3)
      .pipe(
        map((v) => {
          if (v === 2) {
            throw new Error('projection');
          }
          return v;
        }),
      )
      .subscribe({ next: (v) => log.push(`n${v}`), error: (err: Error) => log.push(`E:${err.message}`) });

    expect(log).toEqual(['E:producer', 'n1', 'E:projection']);
  });

  it('Section 2: a Subscription tears down children and functions in order and reports teardown errors together', () => {
    const log: string[] = [];
    const parent = new Subscription(() => log.push('parent'));
    parent.add(new Subscription(() => log.push('child')));
    parent.add(() => log.push('function'));
    parent.unsubscribe();
    parent.add(() => log.push('added after close'));

    expect(log).toEqual(['parent', 'child', 'function', 'added after close']);

    const early: string[] = [];
    const owner = new Subscription();
    const child = new Subscription(() => early.push('child'));
    owner.add(child);
    child.unsubscribe();
    owner.unsubscribe();

    expect(early).toEqual(['child']);

    const failing = new Subscription();
    failing.add(() => {
      throw new Error('a');
    });
    failing.add(() => {
      throw new Error('b');
    });
    let thrown: unknown;
    try {
      failing.unsubscribe();
    } catch (err) {
      thrown = err;
    }

    expect((thrown as UnsubscriptionError).name).toBe('UnsubscriptionError');
    expect((thrown as UnsubscriptionError).errors).toHaveLength(2);
    expect((thrown as UnsubscriptionError).message.startsWith('2 errors occurred during unsubscription:')).toBe(true);
  });

  it('Section 2: subscribe returns a Subscriber, which is a Subscription', () => {
    const sub = of(1).subscribe();

    expect(sub).toBeInstanceOf(Subscriber);
    expect(sub).toBeInstanceOf(Subscription);
  });

  it('Section 2: subscribe accepts an observer, a function and positional callbacks', () => {
    const log: string[] = [];
    const source = of(1);
    source.subscribe();
    source.subscribe({ next: (v) => log.push(`observer ${v}`) });
    source.subscribe((v) => log.push(`function ${v}`));
    source.subscribe(
      (v) => log.push(`positional ${v}`),
      () => log.push('positional error'),
      () => log.push('positional complete'),
    );

    expect(log).toEqual(['observer 1', 'function 1', 'positional 1', 'positional complete']);
  });

  it('Section 2: Observable.create builds an observable that behaves like the constructor', () => {
    const log: number[] = [];
    Observable.create((subscriber: Subscriber<number>) => subscriber.next(7)).subscribe((v: number) => log.push(v));

    expect(log).toEqual([7]);
  });
});
