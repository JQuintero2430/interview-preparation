import * as rxjs from 'rxjs';
import {
  EMPTY,
  NEVER,
  Observable,
  Subject,
  bufferCount,
  count,
  defaultIfEmpty,
  defer,
  distinct,
  distinctUntilChanged,
  distinctUntilKeyChanged,
  elementAt,
  every,
  filter,
  find,
  findIndex,
  first,
  from,
  generate,
  groupBy,
  ignoreElements,
  iif,
  isEmpty,
  last,
  map,
  materialize,
  max,
  mergeMap,
  min,
  of,
  pairwise,
  partition,
  range,
  reduce,
  scan,
  single,
  skip,
  skipUntil,
  skipWhile,
  take,
  takeLast,
  takeUntil,
  takeWhile,
  tap,
  throwError,
  throwIfEmpty,
  timestamp,
  toArray,
  buffer,
} from 'rxjs';
import { legacyMapTo, legacyPairs, legacyPartitionOperator, legacyPluck } from '../legacy/deprecated-forms';

/** One run of an Observable as a list of notifications: `N:value`, `E:name`, `C`. Error classes print as `…Impl`, so `name` is used. */
function notifications<T>(source: Observable<T>): string[] {
  const log: string[] = [];
  source.subscribe({
    next: (value) => log.push(`N:${JSON.stringify(value)}`),
    error: (err: Error) => log.push(`E:${err.name}`),
    complete: () => log.push('C'),
  });
  return log;
}

describe('Section 6: the operator catalogue', () => {
  it('Section 6: the catalogue names exist in rxjs 7.8.2', () => {
    const names = [
      'of', 'from', 'range', 'generate', 'defer', 'timer', 'interval', 'fromEvent', 'iif', 'throwError', 'partition',
      'map', 'scan', 'pairwise', 'bufferCount', 'buffer', 'groupBy', 'toArray',
      'switchMap', 'mergeMap', 'concatMap', 'exhaustMap', 'window', 'windowCount', 'windowTime', 'windowToggle', 'windowWhen', 'expand', 'mergeScan', 'switchScan',
      'filter', 'take', 'takeWhile', 'takeLast', 'takeUntil', 'skip', 'skipWhile', 'skipUntil', 'first', 'last', 'single', 'elementAt',
      'ignoreElements', 'distinct', 'distinctUntilChanged', 'distinctUntilKeyChanged',
      'tap', 'materialize', 'dematerialize', 'timestamp', 'timeInterval', 'delay', 'timeout', 'startWith', 'endWith',
      'defaultIfEmpty', 'throwIfEmpty', 'isEmpty', 'every', 'find', 'findIndex',
      'reduce', 'count', 'min', 'max',
    ];
    const exports = rxjs as unknown as Record<string, unknown>;

    expect(names.filter((name) => typeof exports[name] !== 'function')).toEqual([]);
    expect(typeof exports['EMPTY']).toBe('object');
    expect(typeof exports['NEVER']).toBe('object');
  });

  it('Section 6: creation functions emit what the table says', () => {
    let factoryRuns = 0;
    const deferred = defer(() => {
      factoryRuns++;
      return of('made');
    });
    const [odd, even] = partition(of(1, 2, 3, 4), (v) => v % 2 === 1);

    expect(notifications(of(1, 2))).toEqual(['N:1', 'N:2', 'C']);
    expect(notifications(of([1, 2]))).toEqual(['N:[1,2]', 'C']);
    expect(notifications(from([1, 2]))).toEqual(['N:1', 'N:2', 'C']);
    expect(notifications(range(3, 3))).toEqual(['N:3', 'N:4', 'N:5', 'C']);
    expect(notifications(generate({ initialState: 1, condition: (x) => x < 20, iterate: (x) => x * 2 }))).toEqual(['N:1', 'N:2', 'N:4', 'N:8', 'N:16', 'C']);
    expect(factoryRuns).toBe(0);

    notifications(deferred);
    notifications(deferred);

    expect(factoryRuns).toBe(2);
    expect(notifications(iif(() => true, of('a'), of('b')))).toEqual(['N:"a"', 'C']);
    expect(notifications(iif(() => false, of('a'), of('b')))).toEqual(['N:"b"', 'C']);
    expect(notifications(EMPTY)).toEqual(['C']);
    expect(notifications(NEVER)).toEqual([]);
    expect(notifications(throwError(() => new Error('x')))).toEqual(['E:Error']);
    expect([notifications(odd), notifications(even)]).toEqual([['N:1', 'N:3', 'C'], ['N:2', 'N:4', 'C']]);
  });

  it('Section 6: scan emits every accumulation and reduce only the last', () => {
    expect(notifications(of(1, 2, 3).pipe(scan((acc, v) => acc + v)))).toEqual(['N:1', 'N:3', 'N:6', 'C']);
    expect(notifications(of(1, 2, 3).pipe(scan((acc, v) => acc + v, 10)))).toEqual(['N:11', 'N:13', 'N:16', 'C']);
    expect(notifications(of(1, 2, 3).pipe(reduce((acc, v) => acc + v, 10)))).toEqual(['N:16', 'C']);
    expect(notifications(of(1, 2, 3).pipe(reduce((acc, v) => acc + v)))).toEqual(['N:6', 'C']);
  });

  it('Section 6: reduce and scan on an empty source with and without a seed', () => {
    expect(notifications(EMPTY.pipe(scan((acc: number, v: number) => acc + v)))).toEqual(['C']);
    expect(notifications(EMPTY.pipe(scan((acc: number, v: number) => acc + v, 0)))).toEqual(['C']);
    expect(notifications(EMPTY.pipe(reduce((acc: number, v: number) => acc + v)))).toEqual(['C']);
    expect(notifications(EMPTY.pipe(reduce((acc: number, v: number) => acc + v, 10)))).toEqual(['N:10', 'C']);
  });

  it('Section 6: pairwise and bufferCount', () => {
    expect(notifications(of(1, 2, 3, 4).pipe(pairwise()))).toEqual(['N:[1,2]', 'N:[2,3]', 'N:[3,4]', 'C']);
    expect(notifications(of(1).pipe(pairwise()))).toEqual(['C']);
    expect(notifications(of(1, 2, 3, 4).pipe(bufferCount(3)))).toEqual(['N:[1,2,3]', 'N:[4]', 'C']);
    expect(notifications(of(1, 2, 3, 4).pipe(bufferCount(2, 1)))).toEqual(['N:[1,2]', 'N:[2,3]', 'N:[3,4]', 'N:[4]', 'C']);
    expect(notifications(EMPTY.pipe(bufferCount(2)))).toEqual(['C']);

    const source = new Subject<number>();
    const notifier = new Subject<void>();
    const batches: number[][] = [];
    source.pipe(buffer(notifier)).subscribe((batch) => batches.push(batch));
    source.next(1);
    source.next(2);
    notifier.next();
    source.next(3);
    source.complete();

    expect(batches).toEqual([[1, 2], [3]]);
    expect(notifications(EMPTY.pipe(buffer(NEVER)))).toEqual(['N:[]', 'C']);
    expect(notifications(of(1, 2, 3, 4).pipe(groupBy((v) => v % 2), mergeMap((group) => group.pipe(toArray()))))).toEqual(['N:[1,3]', 'N:[2,4]', 'C']);
  });

  it('Section 6: first, take(1), last and single on empty, one-value and many-value sources', () => {
    const operators: Record<string, (source: Observable<number>) => Observable<number>> = {
      first: (s) => s.pipe(first()),
      'take(1)': (s) => s.pipe(take(1)),
      last: (s) => s.pipe(last()),
      single: (s) => s.pipe(single()),
    };
    const rows = Object.entries(operators).map(([name, apply]) => [name, notifications(apply(EMPTY)), notifications(apply(of(1))), notifications(apply(of(1, 2, 3)))]);

    expect(rows).toEqual([
      ['first', ['E:EmptyError'], ['N:1', 'C'], ['N:1', 'C']],
      ['take(1)', ['C'], ['N:1', 'C'], ['N:1', 'C']],
      ['last', ['E:EmptyError'], ['N:1', 'C'], ['N:3', 'C']],
      ['single', ['E:EmptyError'], ['N:1', 'C'], ['E:SequenceError']],
    ]);
    expect(notifications(EMPTY.pipe(first(undefined, 0)))).toEqual(['N:0', 'C']);
    expect(notifications(EMPTY.pipe(last(undefined, 0)))).toEqual(['N:0', 'C']);
    expect(notifications(of(1, 2, 3).pipe(first((v) => v > 1)))).toEqual(['N:2', 'C']);
    expect(notifications(of(1, 2).pipe(single((v) => v > 5)))).toEqual(['E:NotFoundError']);
    expect(notifications(of(1, 2).pipe(single((v) => v > 1)))).toEqual(['N:2', 'C']);
    expect(notifications(of(1).pipe(elementAt(3)))).toEqual(['E:ArgumentOutOfRangeError']);
    expect(notifications(of(1).pipe(elementAt(3, 9)))).toEqual(['N:9', 'C']);
  });

  it('Section 6: filtering operators on a source and on an empty source', () => {
    const source = of(1, 2, 3, 1);
    const emptyRuns = [
      EMPTY.pipe(filter(() => true)),
      EMPTY.pipe(take(1)),
      EMPTY.pipe(takeLast(2)),
      EMPTY.pipe(skip(1)),
      EMPTY.pipe(takeWhile(() => true)),
      EMPTY.pipe(skipWhile(() => true)),
      EMPTY.pipe(ignoreElements()),
      EMPTY.pipe(distinct()),
      EMPTY.pipe(distinctUntilChanged()),
      EMPTY.pipe(takeUntil(NEVER)),
      EMPTY.pipe(skipUntil(NEVER)),
    ].map((run) => notifications(run));

    expect(new Set(emptyRuns.map((run) => run.join()))).toEqual(new Set(['C']));
    expect(notifications(source.pipe(takeWhile((v) => v < 3)))).toEqual(['N:1', 'N:2', 'C']);
    expect(notifications(source.pipe(takeWhile((v) => v < 3, true)))).toEqual(['N:1', 'N:2', 'N:3', 'C']);
    expect(notifications(source.pipe(skipWhile((v) => v < 3)))).toEqual(['N:3', 'N:1', 'C']);
    expect(notifications(of(1, 2, 3, 4).pipe(takeLast(2)))).toEqual(['N:3', 'N:4', 'C']);
    expect(notifications(source.pipe(ignoreElements()))).toEqual(['C']);

    const gate = new Subject<void>();
    const feed = new Subject<number>();
    const until: string[] = [];
    const after: number[] = [];
    feed.pipe(takeUntil(gate)).subscribe({ next: (v) => until.push(`${v}`), complete: () => until.push('C') });
    feed.pipe(skipUntil(gate)).subscribe((v) => after.push(v));
    feed.next(1);
    gate.next();
    feed.next(2);

    expect(until).toEqual(['1', 'C']);
    expect(after).toEqual([2]);
  });

  it('Section 6: distinctUntilChanged compares with === by default', () => {
    expect(notifications(of(1, 1, 2, 2, 1).pipe(distinctUntilChanged()))).toEqual(['N:1', 'N:2', 'N:1', 'C']);
    expect(notifications(of(1, 1, 2, 2, 1).pipe(distinct()))).toEqual(['N:1', 'N:2', 'C']);

    const equalObjects = [{ a: 1 }, { a: 1 }];

    expect(notifications(from(equalObjects).pipe(distinctUntilChanged()))).toEqual(['N:{"a":1}', 'N:{"a":1}', 'C']);
    expect(notifications(from(equalObjects).pipe(distinctUntilChanged((x, y) => x.a === y.a)))).toEqual(['N:{"a":1}', 'C']);
    expect(notifications(from(equalObjects).pipe(distinctUntilKeyChanged('a')))).toEqual(['N:{"a":1}', 'C']);
  });

  it('Section 6: conditional and aggregation operators on an empty source', () => {
    const rows: Record<string, string[]> = {
      defaultIfEmpty: notifications(EMPTY.pipe(defaultIfEmpty('d'))),
      throwIfEmpty: notifications(EMPTY.pipe(throwIfEmpty())),
      isEmpty: notifications(EMPTY.pipe(isEmpty())),
      every: notifications(EMPTY.pipe(every(() => false))),
      find: notifications(EMPTY.pipe(find(() => true))),
      findIndex: notifications(EMPTY.pipe(findIndex(() => true))),
      count: notifications(EMPTY.pipe(count())),
      min: notifications(EMPTY.pipe(min())),
      max: notifications(EMPTY.pipe(max())),
      toArray: notifications(EMPTY.pipe(toArray())),
      tap: notifications(EMPTY.pipe(tap(() => undefined))),
    };

    expect(rows).toEqual({
      defaultIfEmpty: ['N:"d"', 'C'],
      throwIfEmpty: ['E:EmptyError'],
      isEmpty: ['N:true', 'C'],
      every: ['N:true', 'C'],
      find: ['N:undefined', 'C'],
      findIndex: ['N:-1', 'C'],
      count: ['N:0', 'C'],
      min: ['C'],
      max: ['C'],
      toArray: ['N:[]', 'C'],
      tap: ['C'],
    });
    expect(notifications(of(1).pipe(isEmpty()))).toEqual(['N:false', 'C']);
    expect(notifications(of(1, 2, 3).pipe(find((v) => v > 1)))).toEqual(['N:2', 'C']);
    expect(notifications(of(1, 2, 3).pipe(findIndex((v) => v > 1)))).toEqual(['N:1', 'C']);
    expect(notifications(of(1, 2, 3).pipe(count((v) => v > 1)))).toEqual(['N:2', 'C']);
    expect(notifications(of(3, 1, 2).pipe(min()))).toEqual(['N:1', 'C']);
    expect(notifications(of(3, 1, 2).pipe(max()))).toEqual(['N:3', 'C']);

    const live = new Subject<number>();
    const collected: number[][] = [];
    live.pipe(toArray()).subscribe((all) => collected.push(all));
    live.next(1);

    expect(collected).toEqual([]);

    live.complete();

    expect(collected).toEqual([[1]]);
  });

  it('Section 6: materialize turns notifications into values', () => {
    expect(notifications(of(1).pipe(materialize()))).toEqual(['N:{"kind":"N","value":1,"hasValue":true}', 'N:{"kind":"C","hasValue":false}', 'C']);
    expect(notifications(EMPTY.pipe(materialize()))).toEqual(['N:{"kind":"C","hasValue":false}', 'C']);

    const stamped: { value: number; timestamp: number }[] = [];
    of(1).pipe(timestamp()).subscribe((s) => stamped.push(s));

    expect(Object.keys(stamped[0]).sort()).toEqual(['timestamp', 'value']);
    expect(stamped[0].value).toBe(1);
    expect(notifications(EMPTY.pipe(timestamp()))).toEqual(['C']);
  });

  it('Section 6: the replacements for pluck, mapTo, the partition operator and pairs give the same values', () => {
    const users = of({ user: { name: 'Ada' } });
    const entries = { a: 1, b: 2 };
    const [legacyOdd, legacyEven] = legacyPartitionOperator(of(1, 2, 3, 4));
    const [odd, even] = partition(of(1, 2, 3, 4), (v) => v % 2 === 1);

    expect(notifications(legacyPluck(users))).toEqual(notifications(users.pipe(map((x) => x?.user?.name))));
    expect(notifications(legacyMapTo(of(1, 2)))).toEqual(notifications(of(1, 2).pipe(map(() => 'x'))));
    expect([notifications(legacyOdd), notifications(legacyEven)]).toEqual([notifications(odd), notifications(even)]);
    expect(notifications(legacyPairs(entries))).toEqual(notifications(from(Object.entries(entries))));
    expect(notifications(from(Object.entries(entries)))).toEqual(['N:["a",1]', 'N:["b",2]', 'C']);
  });
});
