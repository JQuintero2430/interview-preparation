// LEGACY: forms that RxJS 7.8.2 still ships and its typings mark `@deprecated`, plus the nested-subscribe habit
// the flattening operators replaced. They exist for the `#### Legacy` subsections of module 23 and for the specs
// of the task that created each one; new code uses the replacement named on each function. Later tasks add
// functions below and keep these unchanged.
import {
  Observable,
  ObservableInput,
  SchedulerLike,
  Subscription,
  debounceTime,
  delay,
  exhaust,
  flatMap,
  from,
  merge,
  mergeMap,
  of,
  repeatWhen,
  retryWhen,
  switchMap,
  take,
  throwError,
  timeoutWith,
  timer,
} from 'rxjs';

// --- Section 1 (SEC-M23-01) ---

/** A `resultSelector` as second argument of `switchMap`. Replacement: an inner `map`. */
export function legacyResultSelector(
  terms: Observable<string>,
  search: (term: string) => Observable<string>,
): Observable<string> {
  return terms.pipe(switchMap(search, (term, result) => `${term}:${result}`));
}

/** `flatMap`, the old name of `mergeMap`. Replacement: `mergeMap`. */
export function legacyFlatMap(
  source: Observable<string>,
  project: (value: string) => Observable<string>,
): Observable<string> {
  return source.pipe(flatMap(project));
}

/** `exhaust`, the old name of `exhaustAll`. Replacement: `exhaustAll`. */
export function legacyExhaust(source: Observable<Observable<string>>): Observable<string> {
  return source.pipe(exhaust());
}

/**
 * A `subscribe` inside a `subscribe`: the habit the flattening operators replaced. The returned subscription
 * owns only the outer stream; each inner subscription is created and forgotten. Replacement: `switchMap`,
 * `mergeMap`, `concatMap` or `exhaustMap`, chosen by what a new outer value should do.
 */
export function legacyNestedSubscribe(
  terms: Observable<string>,
  search: (term: string) => Observable<string>,
  onResult: (result: string) => void,
): Subscription {
  return terms.subscribe((term) => {
    search(term).subscribe(onResult);
  });
}

// --- Section 3 (SEC-M23-03) ---

/**
 * `throwError` with an error value: the error is built once, when this function runs, and every subscriber gets
 * that same object. Replacement: `throwError(() => new Error(message))`, which builds a new error per subscription.
 */
export function legacyThrowErrorValue(message: string): Observable<never> {
  return throwError(new Error(message));
}

// --- Section 4 (SEC-M23-04) ---

/**
 * `retryWhen`: the notifier receives the stream of errors, and each value it emits re-subscribes the source.
 * Giving up needs an explicit `throwError`, because a notifier that completes completes the result silently.
 * Replacement: `retry({ count, delay })`.
 */
export function legacyRetryWhen<T>(source: Observable<T>, count: number, delayMs: number): Observable<T> {
  return source.pipe(
    retryWhen((errors) =>
      errors.pipe(mergeMap((err: unknown, index) => (index < count ? timer(delayMs) : throwError(() => err)))),
    ),
  );
}

/**
 * `repeatWhen`: the notifier receives one notification per source completion, and each value it emits
 * re-subscribes the source. Replacement: `repeat({ count, delay })`.
 */
export function legacyRepeatWhen<T>(source: Observable<T>, count: number, delayMs: number): Observable<T> {
  return source.pipe(repeatWhen((completions) => completions.pipe(take(count - 1), delay(delayMs))));
}

// --- Section 8 (SEC-M23-08) ---

/**
 * `timeoutWith`: switches to `fallback` when the source stays silent for `waitFor` milliseconds (frames in virtual
 * time), the `each` form of `timeout`. Replacement: `timeout({ each: waitFor, with: () => fallback })`.
 */
export function legacyTimeoutWith<T, R>(
  source: Observable<T>,
  waitFor: number,
  fallback: ObservableInput<R>,
): Observable<T | R> {
  return source.pipe(timeoutWith(waitFor, fallback));
}

/**
 * A typeahead with a `subscribe` inside a `subscribe` and a hand-written cancel of the previous search. It repeats
 * by hand what `switchMap` does and has no error handling. The returned subscription owns only the outer stream:
 * the last search stays subscribed. Replacement: `debounceTime`, `switchMap` and an inner `catchError`.
 */
export function legacyTypeaheadNestedSubscribe(
  terms: Observable<string>,
  search: (term: string) => Observable<string>,
  onResult: (result: string) => void,
  debounceMs: number,
): Subscription {
  let previous: Subscription | undefined;
  return terms.pipe(debounceTime(debounceMs)).subscribe((term) => {
    previous?.unsubscribe();
    previous = search(term).subscribe(onResult);
  });
}

// --- Section 9 (SEC-M23-09) ---

/** `of` with a trailing scheduler argument. Replacement: `scheduled([1, 2], scheduler)`. */
export function legacyOfWithScheduler(scheduler: SchedulerLike): Observable<number> {
  return of(1, 2, scheduler);
}

/** `from` with a scheduler argument. Replacement: `scheduled(values, scheduler)`. */
export function legacyFromWithScheduler(values: number[], scheduler: SchedulerLike): Observable<number> {
  return from(values, scheduler);
}

/** `merge` with a trailing scheduler argument. Replacement: `scheduled([a, b], scheduler).pipe(mergeAll())`. */
export function legacyMergeWithScheduler(
  a: Observable<number>,
  b: Observable<number>,
  scheduler: SchedulerLike,
): Observable<number> {
  return merge(a, b, scheduler);
}
