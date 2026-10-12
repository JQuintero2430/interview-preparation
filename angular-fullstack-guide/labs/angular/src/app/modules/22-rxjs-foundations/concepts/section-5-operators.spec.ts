import {
  MonoTypeOperatorFunction,
  Observable,
  OperatorFunction,
  Subject,
  combineLatestWith,
  concatWith,
  filter,
  from,
  isObservable,
  map,
  mergeWith,
  of,
  pipe,
  raceWith,
  scan,
  zipWith,
} from 'rxjs';
import * as root from 'rxjs';
import * as operators from 'rxjs/operators';
import {
  legacyCombineLatest,
  legacyConcat,
  legacyMapTo,
  legacyMerge,
  legacyObservableCreate,
  legacyPairs,
  legacyPartitionOperator,
  legacyPluck,
  legacyPublishRefCount,
  legacyRace,
  legacySubscribePositional,
  legacyToPromise,
  legacyZip,
} from '../legacy/deprecated-forms';

// --- Two hand-written operators that differ in one line: only `good` returns the upstream subscription ---

function leakyTap<T>(fn: (value: T) => void): MonoTypeOperatorFunction<T> {
  return (source) =>
    new Observable<T>((subscriber) => {
      source.subscribe({
        next: (value) => {
          fn(value);
          subscriber.next(value);
        },
        error: (err) => subscriber.error(err),
        complete: () => subscriber.complete(),
      });
    });
}

function goodTap<T>(fn: (value: T) => void): MonoTypeOperatorFunction<T> {
  return (source) =>
    new Observable<T>((subscriber) =>
      source.subscribe({
        next: (value) => {
          fn(value);
          subscriber.next(value);
        },
        error: (err) => subscriber.error(err),
        complete: () => subscriber.complete(),
      }),
    );
}

// --- A counter kept in the factory closure is shared by every subscription, one kept in the subscribe function is not ---

function sharedCounter(): MonoTypeOperatorFunction<number> {
  let count = 10;
  return (source) =>
    new Observable<number>((subscriber) =>
      source.subscribe({ next: () => subscriber.next(++count), error: (e) => subscriber.error(e), complete: () => subscriber.complete() }),
    );
}

function ownCounter(): MonoTypeOperatorFunction<number> {
  return (source) =>
    new Observable<number>((subscriber) => {
      let count = 10;
      return source.subscribe({ next: () => subscriber.next(++count), error: (e) => subscriber.error(e), complete: () => subscriber.complete() });
    });
}

function collect<T>(source: Observable<T>): T[] {
  const values: T[] = [];
  source.subscribe((value) => values.push(value));
  return values;
}

describe('Section 5: pipeable operators', () => {
  it('Section 5: pipe composes left to right and returns a new observable', () => {
    const log: string[] = [];
    const source = new Observable<number>((subscriber) => {
      log.push('producer');
      subscriber.next(1);
      subscriber.complete();
    });

    const piped = source.pipe(
      map((v) => v + 1),
      map((v) => v * 10),
    );

    expect(piped).not.toBe(source);
    expect(log).toEqual([]);
    expect(collect(piped)).toEqual([20]);
    expect(log).toEqual(['producer']);
    expect(collect(source)).toEqual([1]);
  });

  it('Section 5: pipe with no operators returns the same observable', () => {
    const source = of(1, 2);
    const fn = (o: Observable<number>): Observable<number> => o;

    expect(source.pipe()).toBe(source);
    expect(pipe()(source)).toBe(source);
    expect(pipe(fn)).toBe(fn);
  });

  it('Section 5: an operator built with pipe is reusable across observables', () => {
    const discardOddDoubleEven = (): MonoTypeOperatorFunction<number> =>
      pipe(
        filter((v: number) => !(v % 2)),
        map((v: number) => v + v),
      );
    const operator = discardOddDoubleEven();

    expect(collect(of(1, 2, 3, 4).pipe(operator))).toEqual([4, 8]);
    expect(collect(from([10, 11, 12]).pipe(operator))).toEqual([20, 24]);
  });

  it('Section 5: a from-scratch operator must return the upstream subscription', () => {
    const log: string[] = [];
    const source = new Observable<number>(() => {
      log.push('source subscribed');
      return () => log.push('source teardown');
    });

    const leaky = source.pipe(leakyTap(() => undefined)).subscribe();
    leaky.unsubscribe();
    log.push('leaky unsubscribed');
    const good = source.pipe(goodTap(() => undefined)).subscribe();
    good.unsubscribe();
    log.push('good unsubscribed');

    expect(log).toEqual(['source subscribed', 'leaky unsubscribed', 'source subscribed', 'source teardown', 'good unsubscribed']);
  });

  it('Section 5: state declared in the subscribe function is per subscription', () => {
    const source = of(0, 0);
    const shared = source.pipe(sharedCounter());
    const own = source.pipe(ownCounter());
    const sum = of(1, 2, 3).pipe(scan((acc, v) => acc + v));

    expect([collect(shared), collect(shared)]).toEqual([
      [11, 12],
      [13, 14],
    ]);
    expect([collect(own), collect(own)]).toEqual([
      [11, 12],
      [11, 12],
    ]);
    expect([collect(sum), collect(sum)]).toEqual([
      [1, 3, 6],
      [1, 3, 6],
    ]);
  });

  it('Section 5: an error thrown in an operator projection becomes an error notification', () => {
    const log: string[] = [];

    of(1, 2, 3)
      .pipe(
        map((v) => {
          if (v === 2) {
            throw new Error('projection');
          }
          return v;
        }),
      )
      .subscribe({ next: (v) => log.push(`N:${v}`), error: (e: Error) => log.push(`E:${e.message}`), complete: () => log.push('C') });

    expect(log).toEqual(['N:1', 'E:projection']);
  });

  it('Section 5: rxjs/operators exports different functions for merge, concat, zip, combineLatest and race', () => {
    const rootNames = root as unknown as Record<string, unknown>;
    const subpathNames = operators as unknown as Record<string, unknown>;
    const different = Object.keys(subpathNames)
      .filter((name) => name in rootNames && rootNames[name] !== subpathNames[name])
      .sort();

    expect(different).toEqual(['combineLatest', 'concat', 'merge', 'onErrorResumeNext', 'partition', 'race', 'zip']);
    expect(['map', 'share', 'pluck', 'mapTo', 'flatMap', 'combineAll', 'exhaust', 'publish', 'multicast'].filter((n) => rootNames[n] !== subpathNames[n])).toEqual([]);

    const created = root.merge(of(1), of(2));
    const fromSubpath: unknown = operators.merge(of(1), of(2));

    expect(isObservable(created)).toBe(true);
    expect(isObservable(fromSubpath)).toBe(false);
    expect(typeof fromSubpath).toBe('function');
    expect(collect(of(1).pipe(operators.merge(of(2))))).toEqual([1, 2]);
  });

  it('Section 5: the instance operators from rxjs/operators give what the With operators give', () => {
    const a = of(1, 2);
    const b = of(3, 4);

    expect(collect(legacyMerge(a, b))).toEqual(collect(a.pipe(mergeWith(b))));
    expect(collect(legacyConcat(a, b))).toEqual(collect(a.pipe(concatWith(b))));
    expect(collect(legacyZip(a, b))).toEqual(collect(a.pipe(zipWith(b))));
    expect(collect(legacyCombineLatest(a, b))).toEqual(collect(a.pipe(combineLatestWith(b))));
    expect(collect(legacyRace(a, b))).toEqual(collect(a.pipe(raceWith(b))));
    expect(collect(legacyZip(a, b))).toEqual([
      [1, 3],
      [2, 4],
    ]);
  });

  it('Section 5: the deprecated forms in legacy/deprecated-forms still run', async () => {
    const log: string[] = [];
    legacySubscribePositional(of(1), log);
    const created: number[] = [];
    legacyObservableCreate().subscribe((v) => created.push(v));
    const [odd, even] = legacyPartitionOperator(of(1, 2, 3, 4));
    const subject = new Subject<number>();
    const published = legacyPublishRefCount(subject);
    const first: number[] = [];
    const second: number[] = [];
    published.subscribe((v) => first.push(v));
    published.subscribe((v) => second.push(v));
    subject.next(1);

    expect(log).toEqual(['next 1', 'complete']);
    expect(created).toEqual([1]);
    expect(await legacyToPromise(of(1, 2))).toBe(2);
    expect(collect(legacyPluck(of({ user: { name: 'Ada' } })))).toEqual(['Ada']);
    expect(collect(legacyMapTo(of(1, 2)))).toEqual(['x', 'x']);
    expect([collect(odd), collect(even)]).toEqual([[1, 3], [2, 4]]);
    expect(collect(legacyPairs({ a: 1 }))).toEqual([['a', 1]]);
    expect([first, second]).toEqual([[1], [1]]);
  });

  it('Section 5: the operator signatures type-check', () => {
    const toLength: OperatorFunction<string, number> = map((s: string) => s.length);
    const keepTrue: MonoTypeOperatorFunction<boolean> = filter((b: boolean) => b);

    expect(collect(of('a', 'bb').pipe(toLength))).toEqual([1, 2]);
    expect(collect(of(true, false).pipe(keepTrue))).toEqual([true]);

    const wrongSource = (): Observable<number> =>
      // @ts-expect-error a number source does not fit OperatorFunction<string, number>
      of(1).pipe(toLength);
    const wrongResult = (): Observable<string> =>
      // @ts-expect-error the result is Observable<number>, not Observable<string>
      of('a').pipe(toLength);

    expect(typeof wrongSource).toBe('function');
    expect(typeof wrongResult).toBe('function');
  });
});
