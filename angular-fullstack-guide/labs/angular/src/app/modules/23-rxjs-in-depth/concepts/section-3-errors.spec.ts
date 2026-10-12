import {
  EMPTY,
  Observable,
  catchError,
  defer,
  finalize,
  of,
  onErrorResumeNextWith,
  switchMap,
  take,
  throwError,
} from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { timeline } from '../../22-rxjs-foundations/concepts/support/timeline';
import { legacyThrowErrorValue } from '../legacy/deprecated-forms';

/** The inner request for one outer value: `b` fails at once, every other value answers `res-<value>` and completes. */
function request(cold: (marbles: string, values?: Record<string, string>) => Observable<string>, v: string) {
  return v === 'b' ? cold('#') : cold('x|', { x: `res-${v}` });
}

describe('Section 3: errors, catchError and finalize', () => {
  it('Section 3: catchError after switchMap ends the stream and inside the inner keeps it alive', () => {
    expect(
      timeline(({ cold }) =>
        cold('a-b-c|').pipe(
          switchMap((v) => request(cold, v)),
          catchError(() => of('fallback')),
        ),
      ),
    ).toEqual([
      [0, 'N', 'res-a'],
      [2, 'N', 'fallback'],
      [2, 'C'],
    ]);
    expect(
      timeline(({ cold }) =>
        cold('a-b-c|').pipe(switchMap((v) => request(cold, v).pipe(catchError(() => of('fallback'))))),
      ),
    ).toEqual([
      [0, 'N', 'res-a'],
      [2, 'N', 'fallback'],
      [4, 'N', 'res-c'],
      [5, 'C'],
    ]);
  });

  it('Section 3: catchError returning EMPTY completes silently', () => {
    expect(timeline(({ cold }) => cold('a-#').pipe(catchError(() => EMPTY)))).toEqual([
      [0, 'N', 'a'],
      [2, 'C'],
    ]);
  });

  it('Section 3: a rethrow replaces the error with a new one', () => {
    const log: string[] = [];
    const scheduler = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
    scheduler.run(({ cold }) => {
      cold('a-#', undefined, new Error('orig'))
        .pipe(catchError((err: Error) => throwError(() => new Error(`wrapped:${err.message}`))))
        .subscribe({
          next: (v) => log.push(`${v}@${scheduler.now()}`),
          error: (err: Error) => log.push(`E:${err.message}@${scheduler.now()}`),
        });
    });
    expect(log).toEqual(['a@0', 'E:wrapped:orig@2']);
  });

  it('Section 3: returning caught re-subscribes the source', () => {
    let subscriptions = 0;
    const result = timeline(({ cold }) =>
      defer(() => {
        subscriptions++;
        return cold('a#');
      }).pipe(
        catchError((_err, caught) => caught),
        take(5),
      ),
    );
    expect(result).toEqual([
      [0, 'N', 'a'],
      [1, 'N', 'a'],
      [2, 'N', 'a'],
      [3, 'N', 'a'],
      [4, 'N', 'a'],
      [4, 'C'],
    ]);
    expect(subscriptions).toBe(5);
  });

  it('Section 3: finalize runs after complete, after error and after unsubscribe, after the source teardown', () => {
    const log: string[] = [];
    of(1)
      .pipe(
        finalize(() => log.push('fin1')),
        finalize(() => log.push('fin2')),
      )
      .subscribe({ next: (v) => log.push(`next ${v}`), complete: () => log.push('complete') });
    expect(log).toEqual(['next 1', 'complete', 'fin1', 'fin2']);

    log.length = 0;
    throwError(() => new Error('x'))
      .pipe(finalize(() => log.push('fin')))
      .subscribe({ error: () => log.push('error') });
    expect(log).toEqual(['error', 'fin']);

    log.length = 0;
    new Observable<number>(() => () => log.push('teardown'))
      .pipe(finalize(() => log.push('fin')))
      .subscribe()
      .unsubscribe();
    expect(log).toEqual(['teardown', 'fin']);

    log.length = 0;
    new Observable<number>((subscriber) => {
      subscriber.complete();
      return () => log.push('src teardown');
    })
      .pipe(finalize(() => log.push('fin')))
      .subscribe({ complete: () => log.push('complete') });
    expect(log).toEqual(['complete', 'src teardown', 'fin']);
  });

  it('Section 3: take(1) completes before a later error', () => {
    expect(timeline(({ cold }) => cold('a#').pipe(take(1)))).toEqual([
      [0, 'N', 'a'],
      [0, 'C'],
    ]);
  });

  it('Section 3: onErrorResumeNextWith moves to the next source after an error', () => {
    expect(timeline(({ cold }) => cold('a#').pipe(onErrorResumeNextWith(cold('x|'))))).toEqual([
      [0, 'N', 'a'],
      [1, 'N', 'x'],
      [2, 'C'],
    ]);
  });

  it('Section 3: throwError with a factory creates the error at subscription', () => {
    let created = 0;
    const failing = throwError(() => {
      created++;
      return new Error('x');
    });
    expect(created).toBe(0);
    const errors: unknown[] = [];
    failing.subscribe({ error: (err) => errors.push(err) });
    failing.subscribe({ error: (err) => errors.push(err) });
    expect(created).toBe(2);
    expect(errors[0]).not.toBe(errors[1]);
  });

  it('Section 3: the deprecated throwError(value) gives every subscriber the one error built at assembly', () => {
    const failing = legacyThrowErrorValue('x');
    const errors: unknown[] = [];
    failing.subscribe({ error: (err) => errors.push(err) });
    failing.subscribe({ error: (err) => errors.push(err) });
    expect(errors).toHaveLength(2);
    expect(errors[0]).toBe(errors[1]);
  });
});
