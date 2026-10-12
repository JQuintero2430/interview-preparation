// LEGACY: forms that RxJS 7.8.2 still ships and its typings mark `@deprecated`. They exist for the guide's
// `#### Legacy` subsections of module 22 and for the specs that run them; new code uses the replacement named
// on each function. Read-only after SEC-M22-05.
import { Observable, pairs } from 'rxjs';
import * as legacy from 'rxjs/operators';

/** Positional `subscribe` callbacks. Replacement: pass an observer object. */
export function legacySubscribePositional(source: Observable<number>, log: string[]): void {
  source.subscribe(
    (value) => log.push(`next ${value}`),
    (err: Error) => log.push(`error ${err.message}`),
    () => log.push('complete'),
  );
}

/** `Observable.create`. Replacement: `new Observable(...)`. */
export function legacyObservableCreate(): Observable<number> {
  return Observable.create((subscriber: { next(v: number): void; complete(): void }) => {
    subscriber.next(1);
    subscriber.complete();
  });
}

/** `toPromise`. Replacement: `lastValueFrom`. */
export function legacyToPromise(source: Observable<number>): Promise<number | undefined> {
  return source.toPromise();
}

/** The `merge` operator from `rxjs/operators`. Replacement: `mergeWith`, or the `merge` creation function. */
export function legacyMerge(a: Observable<number>, b: Observable<number>): Observable<number> {
  return a.pipe(legacy.merge(b));
}

/** The `concat` operator from `rxjs/operators`. Replacement: `concatWith`. */
export function legacyConcat(a: Observable<number>, b: Observable<number>): Observable<number> {
  return a.pipe(legacy.concat(b));
}

/** The `zip` operator from `rxjs/operators`. Replacement: `zipWith`. */
export function legacyZip(a: Observable<number>, b: Observable<number>): Observable<[number, number]> {
  return a.pipe(legacy.zip(b));
}

/** The `combineLatest` operator from `rxjs/operators`. Replacement: `combineLatestWith`. */
export function legacyCombineLatest(a: Observable<number>, b: Observable<number>): Observable<[number, number]> {
  return a.pipe(legacy.combineLatest(b));
}

/** The `race` operator from `rxjs/operators`. Replacement: `raceWith`. */
export function legacyRace(a: Observable<number>, b: Observable<number>): Observable<number> {
  return a.pipe(legacy.race(b));
}

/** `pluck`. Replacement: `map` with optional chaining. */
export function legacyPluck(source: Observable<{ user: { name: string } }>): Observable<string> {
  return source.pipe(legacy.pluck('user', 'name'));
}

/** `mapTo`. Replacement: `map(() => value)`. */
export function legacyMapTo(source: Observable<number>): Observable<string> {
  return source.pipe(legacy.mapTo('x'));
}

/** The `partition` operator. Replacement: the `partition` creation function. */
export function legacyPartitionOperator(source: Observable<number>): [Observable<number>, Observable<number>] {
  return legacy.partition((v: number) => v % 2 === 1)(source);
}

/** `pairs`. Replacement: `from(Object.entries(obj))`. */
export function legacyPairs(obj: Record<string, number>): Observable<[string, number]> {
  return pairs(obj);
}

/** `publish` with `refCount`. Replacement: `share()`. */
export function legacyPublishRefCount(source: Observable<number>): Observable<number> {
  return source.pipe(legacy.publish(), legacy.refCount());
}
