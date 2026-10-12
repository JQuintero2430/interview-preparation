// Exercise 22.3: three operators written from scratch. Each keeps its state inside the subscribe function,
// forwards error and complete, and returns a teardown that unsubscribes the source.
import { MonoTypeOperatorFunction, Observable, Observer, OperatorFunction, Subscriber } from 'rxjs';

/** An observer that hands values to `next` and passes error and complete straight to `subscriber`. */
function forwardTo<T, R>(subscriber: Subscriber<R>, next: (value: T) => void): Partial<Observer<T>> {
  return { next, error: (err: unknown) => subscriber.error(err), complete: () => subscriber.complete() };
}

/** Calls `fn` with the first value of each subscription and passes every notification on unchanged. */
export function tapFirst<T>(fn: (value: T) => void): MonoTypeOperatorFunction<T> {
  return (source) =>
    new Observable<T>((subscriber) => {
      let seenFirst = false;
      return source.subscribe(
        forwardTo(subscriber, (value: T) => {
          if (!seenFirst) fn(value);
          seenFirst = true;
          subscriber.next(value);
        }),
      );
    });
}

/** Emits `[previous, current]`; `previous` is `undefined` for the first value of each subscription. */
export function withPrevious<T>(): OperatorFunction<T, [T | undefined, T]> {
  return (source) =>
    new Observable<[T | undefined, T]>((subscriber) => {
      let previous: T | undefined;
      return source.subscribe(
        forwardTo(subscriber, (value: T) => {
          const pair: [T | undefined, T] = [previous, value];
          previous = value;
          subscriber.next(pair);
        }),
      );
    });
}

/** Completes when `signal` aborts (at once if it already has) and removes its listener when it ends. */
export function takeUntilAbort<T>(signal: AbortSignal): MonoTypeOperatorFunction<T> {
  return (source) =>
    new Observable<T>((subscriber) => {
      if (signal.aborted) {
        subscriber.complete();
        return undefined;
      }
      const onAbort = () => subscriber.complete();
      signal.addEventListener('abort', onAbort);
      const upstream = source.subscribe(forwardTo(subscriber, (value: T) => subscriber.next(value)));
      return () => {
        signal.removeEventListener('abort', onAbort);
        upstream.unsubscribe();
      };
    });
}
