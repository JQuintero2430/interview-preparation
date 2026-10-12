// Exercise 22.1: an Observable built by hand, with no rxjs import. conformance.spec.ts runs one contract
// table against this class and against RxJS's Observable.
export interface MiniObserver<T> {
  next(value: T): void;
  error(err: unknown): void;
  complete(): void;
}
export type MiniTeardown = (() => void) | void;
export type MiniOperator<T, R> = (source: MiniObservable<T>) => MiniObservable<R>;

/** The consumer's observer plus the guarantees: nothing after the end, and the teardown runs once. */
export class MiniSubscriber<T> implements MiniObserver<T> {
  closed = false;
  private stopped = false;
  private teardown: (() => void) | undefined;

  constructor(private readonly destination: Partial<MiniObserver<T>>) {}

  next(value: T): void {
    if (!this.stopped) this.destination.next?.(value);
  }
  error(err: unknown): void {
    this.end(() => this.destination.error?.(err));
  }
  complete(): void {
    this.end(() => this.destination.complete?.());
  }
  /** Keeps the producer's teardown, or runs it at once when the subscriber closed while the producer ran. */
  setTeardown(teardown: MiniTeardown): void {
    if (teardown && this.closed) teardown();
    else if (teardown) this.teardown = teardown;
  }
  unsubscribe(): void {
    if (this.closed) return;
    this.closed = this.stopped = true;
    const teardown = this.teardown;
    this.teardown = undefined;
    teardown?.();
  }
  private end(notify: () => void): void {
    if (this.stopped) return;
    this.stopped = true;
    notify();
    this.unsubscribe();
  }
}

export class MiniObservable<T> {
  constructor(private readonly producer: (subscriber: MiniSubscriber<T>) => MiniTeardown) {}

  subscribe(observerOrNext: Partial<MiniObserver<T>> | ((value: T) => void) = {}): MiniSubscriber<T> {
    const observer = typeof observerOrNext === 'function' ? { next: observerOrNext } : observerOrNext;
    const subscriber = observer instanceof MiniSubscriber ? observer : new MiniSubscriber(observer);
    try {
      subscriber.setTeardown(this.producer(subscriber));
    } catch (err) {
      subscriber.error(err);
    }
    return subscriber;
  }

  pipe(): MiniObservable<T>;
  pipe<A>(op1: MiniOperator<T, A>): MiniObservable<A>;
  pipe<A, B>(op1: MiniOperator<T, A>, op2: MiniOperator<A, B>): MiniObservable<B>;
  pipe(...operators: Array<MiniOperator<unknown, unknown>>): MiniObservable<unknown> {
    return operators.reduce((source, operator) => operator(source), this as MiniObservable<unknown>);
  }
}

/** Builds an operator: `init` runs once per subscription and returns the handler for each upstream value. */
function createOperator<T, R>(init: (subscriber: MiniSubscriber<R>) => (value: T) => void): MiniOperator<T, R> {
  return (source) =>
    new MiniObservable<R>((subscriber) => {
      const onValue = init(subscriber);
      const upstream = new MiniSubscriber<T>({
        next: (value) => onValue(value),
        error: (err) => subscriber.error(err),
        complete: () => subscriber.complete(),
      });
      // Linked before the source runs, so a downstream close reaches a synchronous producer's `closed` check.
      subscriber.setTeardown(() => upstream.unsubscribe());
      source.subscribe(upstream);
    });
}

export const miniMap = <T, R>(project: (value: T) => R): MiniOperator<T, R> =>
  createOperator<T, R>((subscriber) => (value) => subscriber.next(project(value)));

export const miniFilter = <T>(predicate: (value: T) => boolean): MiniOperator<T, T> =>
  createOperator<T, T>((subscriber) => (value) => {
    if (predicate(value)) subscriber.next(value);
  });

export const miniTake = <T>(count: number): MiniOperator<T, T> =>
  createOperator<T, T>((subscriber) => {
    let seen = 0;
    return (value) => {
      subscriber.next(value);
      if (++seen >= count) subscriber.complete();
    };
  });
