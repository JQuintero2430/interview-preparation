import { EventEmitter } from '@angular/core';
import * as interop from '@angular/core/rxjs-interop';
import { EMPTY, EmptyError, Observable, defer, firstValueFrom, from, isObservable, lastValueFrom, of, toArray } from 'rxjs';

// --- A producer that logs each step: the log shows when the work runs and when the teardown runs ---

function loggingSource(log: string[], name: string): Observable<string> {
  return new Observable<string>((subscriber) => {
    log.push('producer');
    subscriber.next(`${name}1`);
    subscriber.complete();
    return () => log.push('teardown');
  });
}

describe('Section 1: push collections', () => {
  it('Section 1: subscribing runs the producer once per subscribe and not before', () => {
    const log: string[] = [];
    const source = loggingSource(log, 'v');
    log.push('created');
    source.subscribe((value) => log.push(value));
    loggingSource(log, 'w').subscribe((value) => log.push(value));

    expect(log).toEqual(['created', 'producer', 'v1', 'teardown', 'producer', 'w1', 'teardown']);

    const again: string[] = [];
    const twice = loggingSource(again, 'x');
    twice.subscribe();
    twice.subscribe();

    expect(again.filter((entry) => entry === 'producer')).toHaveLength(2);
  });

  it('Section 1: delivery from a synchronous producer finishes before subscribe returns', () => {
    const log: Array<number | string> = [];
    of(1, 2, 3).subscribe((value) => log.push(value));
    log.push('after subscribe');

    expect(log).toEqual([1, 2, 3, 'after subscribe']);
  });

  it('Section 1: a promise runs its executor at creation and an observable its producer at subscribe', async () => {
    const log: string[] = [];
    const promise = new Promise<number>((resolve) => {
      log.push('promise executor');
      resolve(1);
    });
    const observable = new Observable<number>((subscriber) => {
      log.push('observable producer');
      subscriber.next(1);
      subscriber.complete();
    });
    log.push('both created');
    observable.subscribe(() => log.push('o next'));
    const first = promise.then(() => log.push('p then'));
    const second = promise.then(() => log.push('p then 2'));
    await Promise.all([first, second]);

    expect(log).toEqual(['promise executor', 'both created', 'observable producer', 'o next', 'p then', 'p then 2']);
  });

  it('Section 1: firstValueFrom subscribes at once and rejects with EmptyError on an empty source', async () => {
    expect(await firstValueFrom(of(1, 2, 3))).toBe(1);
    expect(await lastValueFrom(of(1, 2, 3))).toBe(3);
    expect(await firstValueFrom(EMPTY, { defaultValue: 'd' })).toBe('d');

    const error: unknown = await firstValueFrom(EMPTY).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(EmptyError);
    expect((error as Error).name).toBe('EmptyError');
    expect((error as Error).message).toBe('no elements in sequence');

    const log: string[] = [];
    const pending = firstValueFrom(defer(() => (log.push('subscribed'), of(1))));
    log.push('after firstValueFrom call');
    await pending;

    expect(log).toEqual(['subscribed', 'after firstValueFrom call']);
  });

  it('Section 1: from accepts arrays, strings, sets, maps, promises and async iterables', async () => {
    async function* generate(): AsyncGenerator<string> {
      yield 'ag1';
      yield 'ag2';
    }
    const collect = <T>(source: Observable<T>): Promise<T[]> => lastValueFrom(source.pipe(toArray()));

    expect(await collect(from([1, 2]))).toEqual([1, 2]);
    expect(await collect(from('ab'))).toEqual(['a', 'b']);
    expect(await collect(from(new Set([7])))).toEqual([7]);
    expect(await collect(from(new Map([[1, 'm']])))).toEqual([[1, 'm']]);
    expect(await collect(from(Promise.resolve('p')))).toEqual(['p']);
    expect(await collect(from(generate()))).toEqual(['ag1', 'ag2']);

    const log: string[] = [];
    from(Promise.resolve('promise')).subscribe((value) => log.push(value));
    from([1]).subscribe((value) => log.push(`array${value}`));
    log.push('sync done');
    await Promise.resolve();

    expect(log).toEqual(['array1', 'sync done', 'promise']);
  });

  it('Section 1: an observable is neither thenable nor iterable', async () => {
    const observable = of(1);

    expect('then' in observable).toBe(false);
    expect(Symbol.iterator in observable).toBe(false);
    expect(Symbol.asyncIterator in observable).toBe(false);
    expect(await observable).toBe(observable);
    expect(isObservable(observable)).toBe(true);
    expect(isObservable({ lift: () => undefined, subscribe: () => undefined })).toBe(true);
    expect(isObservable(Promise.resolve(1))).toBe(false);
  });

  it('Section 1: the rxjs-interop module exports the functions named in the table', () => {
    const names = ['outputFromObservable', 'outputToObservable', 'takeUntilDestroyed', 'toObservable', 'toSignal', 'pendingUntilEvent', 'rxResource'];
    const exported = interop as unknown as Record<string, unknown>;

    for (const name of names) {
      expect(typeof exported[name], name).toBe('function');
    }
    expect(typeof EventEmitter).toBe('function');
  });

  it('Section 1: jsdom and Node expose no global Observable', () => {
    expect('Observable' in globalThis).toBe(false);
  });

  it('Section 1: toPromise resolves with the last value, and with undefined on an empty source', async () => {
    expect(await of(1, 2, 3).toPromise()).toBe(3);
    expect(await EMPTY.toPromise()).toBeUndefined();
    expect(await lastValueFrom(EMPTY, { defaultValue: undefined })).toBeUndefined();
  });
});
