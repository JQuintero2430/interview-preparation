import {
  Observable,
  OperatorFunction,
  Subject,
  concatAll,
  concatMap,
  defer,
  exhaust,
  exhaustAll,
  exhaustMap,
  finalize,
  flatMap,
  lastValueFrom,
  map,
  mergeAll,
  mergeMap,
  of,
  switchAll,
  switchMap,
  toArray,
} from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { timeline } from '../../22-rxjs-foundations/concepts/support/timeline';
import { legacyExhaust, legacyFlatMap, legacyNestedSubscribe, legacyResultSelector } from '../legacy/deprecated-forms';

type Flatten = (project: (value: string) => Observable<string>) => OperatorFunction<string, string>;

/**
 * Runs the outer stream `a-b-----c---|` through one flattening operator. Each outer value v maps to a cold inner
 * `--x--y|` emitting v1 and v2; the log records inner subscribe (`subv`), inner finalize (`finv`), values and the
 * complete (`C`), each with its frame.
 */
function flattenLog(flatten: Flatten): string[] {
  const log: string[] = [];
  const scheduler = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
  scheduler.run(({ cold }) => {
    const at = () => scheduler.now();
    const inner = (v: string) =>
      defer(() => {
        log.push(`sub${v}@${at()}`);
        return cold('--x--y|', { x: `${v}1`, y: `${v}2` });
      }).pipe(finalize(() => log.push(`fin${v}@${at()}`)));
    cold('a-b-----c---|')
      .pipe(flatten(inner))
      .subscribe({ next: (v) => log.push(`${v}@${at()}`), complete: () => log.push(`C@${at()}`) });
  });
  return log;
}

describe('Section 1: higher-order Observables and the four flattening operators', () => {
  it('Section 1: switchMap, mergeMap, concatMap and exhaustMap on one outer stream', () => {
    expect(flattenLog((p) => switchMap(p))).toEqual(
      'suba@0 fina@2 subb@2 b1@4 b2@7 finb@8 subc@8 c1@10 c2@13 C@14 finc@14'.split(' '),
    );
    expect(flattenLog((p) => mergeMap(p))).toEqual(
      'suba@0 subb@2 a1@2 b1@4 a2@5 fina@6 b2@7 subc@8 finb@8 c1@10 c2@13 finc@14 C@14'.split(' '),
    );
    expect(flattenLog((p) => concatMap(p))).toEqual(
      'suba@0 a1@2 a2@5 fina@6 subb@6 b1@8 b2@11 finb@12 subc@12 c1@14 c2@17 finc@18 C@18'.split(' '),
    );
    expect(flattenLog((p) => exhaustMap(p))).toEqual('suba@0 a1@2 a2@5 fina@6 subc@8 c1@10 c2@13 C@14 finc@14'.split(' '));
  });

  it('Section 1: mergeMap with concurrency 1 behaves as concatMap and with 2 queues the third', () => {
    const values = (log: string[]) => log.filter((entry) => !entry.startsWith('sub') && !entry.startsWith('fin'));
    expect(values(flattenLog((p) => mergeMap(p, 1)))).toEqual(values(flattenLog((p) => concatMap(p))));
    expect(values(flattenLog((p) => mergeMap(p, 1)))).toEqual('a1@2 a2@5 b1@8 b2@11 c1@14 c2@17 C@18'.split(' '));
    expect(timeline(({ cold }) => cold('abc|').pipe(mergeMap((v) => cold('---x|', { x: v }), 2)))).toEqual([
      [3, 'N', 'a'],
      [4, 'N', 'b'],
      [7, 'N', 'c'],
      [8, 'C'],
    ]);
  });

  it('Section 1: the result completes only after the last inner completes', () => {
    const flatteners: Flatten[] = [(p) => switchMap(p), (p) => mergeMap(p), (p) => concatMap(p), (p) => exhaustMap(p)];
    for (const flatten of flatteners) {
      expect(timeline(({ cold }) => cold('a|').pipe(flatten(() => cold('---x|'))))).toEqual([
        [3, 'N', 'x'],
        [4, 'C'],
      ]);
    }
  });

  it('Section 1: an inner error ends the flattened stream', () => {
    const flatteners: Flatten[] = [(p) => switchMap(p), (p) => mergeMap(p), (p) => concatMap(p), (p) => exhaustMap(p)];
    for (const flatten of flatteners) {
      expect(timeline(({ cold }) => cold('a-b-|').pipe(flatten(() => cold('-#'))))).toEqual([[1, 'E', 'error']]);
    }
  });

  it('Section 1: the All forms flatten an Observable of Observables', () => {
    const run = (flattenAll: OperatorFunction<Observable<string>, string>) =>
      timeline(({ cold }) =>
        cold('a-b|').pipe(
          map((v) => cold('-x-y|', { x: `${v}1`, y: `${v}2` })),
          flattenAll,
        ),
      );
    expect(run(switchAll())).toEqual([[1, 'N', 'a1'], [3, 'N', 'b1'], [5, 'N', 'b2'], [6, 'C']]);
    expect(run(mergeAll())).toEqual([[1, 'N', 'a1'], [3, 'N', 'a2'], [3, 'N', 'b1'], [5, 'N', 'b2'], [6, 'C']]);
    expect(run(concatAll())).toEqual([[1, 'N', 'a1'], [3, 'N', 'a2'], [5, 'N', 'b1'], [7, 'N', 'b2'], [8, 'C']]);
    expect(run(exhaustAll())).toEqual([[1, 'N', 'a1'], [3, 'N', 'a2'], [4, 'C']]);
  });

  it('Section 1: Promise and array inners are accepted', async () => {
    const tenTimes = (v: number) => Promise.resolve(v * 10);
    expect(await lastValueFrom(of(1, 2, 3).pipe(switchMap(tenTimes), toArray()))).toEqual([30]);
    expect(await lastValueFrom(of(1, 2, 3).pipe(mergeMap(tenTimes), toArray()))).toEqual([10, 20, 30]);
    expect(await lastValueFrom(of(1, 2).pipe(concatMap((v) => [v, v]), toArray()))).toEqual([1, 1, 2, 2]);
  });

  it('Section 1: flatMap and exhaust are the same functions as mergeMap and exhaustAll', () => {
    expect(flatMap).toBe(mergeMap);
    expect(exhaust).toBe(exhaustAll);
  });

  it('Section 1: the deprecated forms give what the current forms give', () => {
    const search = (cold: (marbles: string, values?: Record<string, string>) => Observable<string>) => (t: string) =>
      cold('--r|', { r: `R-${t}` });
    expect(timeline(({ cold }) => legacyResultSelector(cold('a----b|'), search(cold)))).toEqual(
      timeline(({ cold }) => cold('a----b|').pipe(switchMap((t) => search(cold)(t).pipe(map((r) => `${t}:${r}`))))),
    );
    expect(timeline(({ cold }) => legacyFlatMap(cold('ab|'), search(cold)))).toEqual(
      timeline(({ cold }) => cold('ab|').pipe(mergeMap(search(cold)))),
    );
    expect(timeline(({ cold }) => legacyExhaust(cold('ab|').pipe(map(search(cold)))))).toEqual(
      timeline(({ cold }) => cold('ab|').pipe(map(search(cold)), exhaustAll())),
    );
  });

  it('Section 1: a nested subscribe delivers stale results and outlives the outer unsubscribe', () => {
    const scenario = (start: (terms: Subject<string>, search: (t: string) => Observable<string>, results: string[]) => { unsubscribe(): void }) => {
      const terms = new Subject<string>();
      const responses = new Map<string, Subject<string>>();
      const search = (t: string) => {
        const response = new Subject<string>();
        responses.set(t, response);
        return response;
      };
      const results: string[] = [];
      const subscription = start(terms, search, results);
      terms.next('a');
      terms.next('ab');
      responses.get('a')?.next('R-a');
      subscription.unsubscribe();
      responses.get('ab')?.next('R-ab');
      return { results, innerStillObserved: responses.get('ab')?.observed };
    };

    expect(scenario((terms, search, results) => legacyNestedSubscribe(terms, search, (r) => results.push(r)))).toEqual({
      results: ['R-a', 'R-ab'],
      innerStillObserved: true,
    });
    expect(scenario((terms, search, results) => terms.pipe(switchMap(search)).subscribe((r) => results.push(r)))).toEqual({
      results: [],
      innerStillObserved: false,
    });
  });
});
