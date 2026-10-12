import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { EMPTY, Observable, Subject, concatMap, exhaustMap, expand, map, mergeMap, mergeScan, of, switchMap, switchScan } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { timeline } from '../../22-rxjs-foundations/concepts/support/timeline';

interface Page {
  readonly page: number;
  readonly next: number | null;
}

const LAST_PAGE = 3;

describe('Section 2: choosing a flattening operator', () => {
  it('Section 2: mergeMap lets a slow stale response arrive last and switchMap drops it', () => {
    const responses = (cold: (m: string, v: Record<string, string>) => Observable<string>) => ({
      a: cold('-----A|', { A: 'A' }),
      b: cold('-B|', { B: 'B' }),
    });
    expect(
      timeline(({ hot, cold }) => {
        const r = responses(cold);
        return hot('a-b|').pipe(mergeMap((t) => (t === 'a' ? r.a : r.b)));
      }),
    ).toEqual([
      [3, 'N', 'B'],
      [5, 'N', 'A'],
      [6, 'C'],
    ]);
    expect(
      timeline(({ hot, cold }) => {
        const r = responses(cold);
        return hot('a-b|').pipe(switchMap((t) => (t === 'a' ? r.a : r.b)));
      }),
    ).toEqual([
      [3, 'N', 'B'],
      [4, 'C'],
    ]);
  });

  it('Section 2: exhaustMap ignores clicks while a submit runs and mergeMap posts each', () => {
    expect(timeline(({ hot, cold }) => hot('a-a-------a|').pipe(exhaustMap(() => cold('---s|'))))).toEqual([
      [3, 'N', 's'],
      [13, 'N', 's'],
      [14, 'C'],
    ]);
    expect(timeline(({ hot, cold }) => hot('a-a-a|').pipe(mergeMap(() => cold('---s|'))))).toEqual([
      [3, 'N', 's'],
      [5, 'N', 's'],
      [7, 'N', 's'],
      [8, 'C'],
    ]);
  });

  it('Section 2: switchMap unsubscribes an in-flight save', () => {
    new TestScheduler((actual, expected) => expect(actual).toEqual(expected)).run(
      ({ cold, expectObservable, expectSubscriptions }) => {
        const saveA = cold('---s|', { s: 'saved:a' });
        const saveB = cold('---s|', { s: 'saved:b' });
        expectObservable(cold('a-b|').pipe(switchMap((v) => (v === 'a' ? saveA : saveB)))).toBe('-----s|', {
          s: 'saved:b',
        });
        expectSubscriptions(saveA.subscriptions).toBe('^-!');
      },
    );
    expect(
      timeline(({ cold }) => cold('a-b|').pipe(concatMap((v) => cold('---s|', { s: `saved:${v}` })))),
    ).toEqual([
      [3, 'N', 'saved:a'],
      [7, 'N', 'saved:b'],
      [8, 'C'],
    ]);
  });

  it('Section 2: switchMap over HttpClient cancels the previous request', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const http = TestBed.inject(HttpClient);
    const controller = TestBed.inject(HttpTestingController);
    const terms = new Subject<string>();
    const results: string[] = [];

    terms.pipe(switchMap((term) => http.get<string>(`/s?q=${term}`))).subscribe((result) => results.push(result));
    terms.next('a');
    terms.next('ab');

    const requests = controller.match(() => true);
    expect(requests.map((r) => r.request.urlWithParams)).toEqual(['/s?q=a', '/s?q=ab']);
    expect(requests.map((r) => r.cancelled)).toEqual([true, false]);
    requests[1].flush('R-ab');
    expect(results).toEqual(['R-ab']);
    controller.verify();
  });

  it('Section 2: expand fetches pages until the last one', () => {
    const pages = timeline(({ cold }) => {
      const fetchPage = (n: number): Observable<Page> =>
        cold('-p|', { p: { page: n, next: n < LAST_PAGE ? n + 1 : null } });
      return fetchPage(1).pipe(
        expand((p) => (p.next === null ? EMPTY : fetchPage(p.next))),
        map((p) => p.page),
      );
    });
    expect(pages).toEqual([
      [1, 'N', 1],
      [2, 'N', 2],
      [3, 'N', 3],
      [4, 'C'],
    ]);
  });

  it('Section 2: expand with synchronous inners recurses within one frame', () => {
    expect(timeline(() => of(1).pipe(expand((x) => (x < 8 ? of(x * 2) : EMPTY))))).toEqual([
      [0, 'N', 1],
      [0, 'N', 2],
      [0, 'N', 4],
      [0, 'N', 8],
      [0, 'C'],
    ]);
  });

  it('Section 2: mergeScan and switchScan accumulate across inner streams', () => {
    const values = { a: 1, b: 2 };
    expect(
      timeline(({ cold }) => cold('a-b|', values).pipe(mergeScan((acc, v) => cold('-x|', { x: acc + v }), 0))),
    ).toEqual([
      [1, 'N', 1],
      [3, 'N', 3],
      [4, 'C'],
    ]);
    expect(
      timeline(({ cold }) => cold('a-b|', values).pipe(switchScan((acc, v) => cold('---x|', { x: acc + v }), 0))),
    ).toEqual([
      [5, 'N', 2],
      [6, 'C'],
    ]);
    expect(
      timeline(({ cold }) => cold('ab|', values).pipe(switchScan((acc, v) => cold('---x|', { x: acc + v }), 10))),
    ).toEqual([
      [4, 'N', 12],
      [5, 'C'],
    ]);
  });
});
