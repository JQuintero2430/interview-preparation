import { TestBed } from '@angular/core/testing';
import { InjectionToken, inject } from '@angular/core';
import {
  EMPTY,
  Observable,
  catchError,
  concat,
  debounceTime,
  defer,
  distinctUntilChanged,
  exhaustMap,
  merge,
  of,
  race,
  repeat,
  startWith,
  switchMap,
  take,
  timeout,
  timer,
} from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { timeline } from '../../22-rxjs-foundations/concepts/support/timeline';
import { legacyTimeoutWith, legacyTypeaheadNestedSubscribe } from '../legacy/deprecated-forms';

type ColdFactory = (marbles: string, values?: Record<string, string>) => Observable<string>;

/** The typeahead pipeline: rate, change filter, query flattening and a per-request recovery. */
function typeahead(terms: Observable<string>, search: (term: string) => Observable<string>): Observable<string> {
  return terms.pipe(
    debounceTime(3),
    distinctUntilChanged(),
    switchMap((term) => search(term).pipe(catchError(() => of('fallback')))),
  );
}

/** Four keystrokes of "angu" (the fourth repeats the third) and a term, `err`, that the search rejects. */
const KEYSTROKES = 'a-b------c--------c-------x---|';
const TERMS = { a: 'an', b: 'ang', c: 'angu', x: 'err' };

/** A search that answers `R:<term>` after 4 frames and fails 2 frames after the request for `err`. */
function searchFor(cold: ColdFactory): (term: string) => Observable<string> {
  return (term) => (term === 'err' ? cold('--#') : cold('----(r|)', { r: `R:${term}` }));
}

/** The page-visibility source, injected so a test can replace it (a real page would wrap `document.visibilityState`). */
const LAB_M23_VISIBLE = new InjectionToken<Observable<boolean>>('lab-m23-visible');

/** Polls every 5 frames without overlap while the page is visible; hiding the page cancels the request in flight. */
function pollWhileVisible(visible$: Observable<boolean>, request: () => Observable<string>): Observable<string> {
  return visible$.pipe(
    distinctUntilChanged(),
    switchMap((visible) => (visible ? timer(0, 5).pipe(exhaustMap(request)) : EMPTY)),
  );
}

/** A slow request: the value `r<n>` at frame 7 and the end one frame later. */
function slowRequest(cold: ColdFactory, n: number): Observable<string> {
  return cold('-------r|', { r: `r${n}` });
}

describe('Section 8: Angular patterns', () => {
  it('Section 8: the typeahead emits the debounced, distinct results and survives a failing search', () => {
    expect(
      timeline(({ hot, cold }) => typeahead(hot(KEYSTROKES, TERMS), searchFor(cold))),
    ).toEqual([
      [9, 'N', 'R:ang'],
      [16, 'N', 'R:angu'],
      [31, 'N', 'fallback'],
      [31, 'C'],
    ]);
  });

  it('Section 8: without an inner catchError the first failure ends the typeahead', () => {
    // Only the term `angu` fails, one frame after its request.
    const failing = (cold: ColdFactory) => (term: string) =>
      term === 'angu' ? cold('-#') : cold('----(r|)', { r: `R:${term}` });
    const withoutInner = timeline(({ hot, cold }) =>
      hot(KEYSTROKES, TERMS).pipe(
        debounceTime(3),
        distinctUntilChanged(),
        switchMap(failing(cold)),
        catchError(() => of('dead')),
      ),
    );
    expect(withoutInner).toEqual([
      [9, 'N', 'R:ang'],
      [13, 'N', 'dead'],
      [13, 'C'],
    ]);

    const scheduler = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
    scheduler.run(({ hot, cold, expectSubscriptions }) => {
      const terms = hot(KEYSTROKES, TERMS);
      terms
        .pipe(debounceTime(3), distinctUntilChanged(), switchMap(failing(cold)), catchError(() => of('dead')))
        .subscribe();
      // The keystroke source was unsubscribed at the failure, so `err` at frame 26 was never read.
      expectSubscriptions(terms.subscriptions).toBe('^------------!');
    });

    expect(timeline(({ hot, cold }) => typeahead(hot(KEYSTROKES, TERMS), failing(cold)))).toEqual([
      [9, 'N', 'R:ang'],
      [13, 'N', 'fallback'],
      [33, 'N', 'R:err'],
      [33, 'C'],
    ]);
  });

  it('Section 8: polling with switchMap starves a slow request and exhaustMap does not', () => {
    // A tick every 5 frames, four ticks, each request takes 7 frames.
    const ticks = () => timer(0, 5).pipe(take(4));
    expect(timeline(({ cold }) => ticks().pipe(switchMap((n) => slowRequest(cold, n + 1))))).toEqual([
      [22, 'N', 'r4'],
      [23, 'C'],
    ]);
    expect(timeline(({ cold }) => ticks().pipe(exhaustMap((n) => slowRequest(cold, n + 1))))).toEqual([
      [7, 'N', 'r1'],
      [17, 'N', 'r3'],
      [18, 'C'],
    ]);
  });

  it('Section 8: repeat with a delay spaces polls after each response', () => {
    let runs = 0;
    expect(
      timeline(({ cold }) =>
        defer(() => slowRequest(cold, ++runs)).pipe(repeat({ count: 3, delay: 5 })),
      ),
    ).toEqual([
      [7, 'N', 'r1'],
      [20, 'N', 'r2'],
      [33, 'N', 'r3'],
      [34, 'C'],
    ]);
  });

  it('Section 8: concat and startWith keep cache before network and merge can overwrite fresh data', () => {
    const ordered = [
      [0, 'N', 'cached'],
      [4, 'N', 'fresh'],
      [5, 'C'],
    ];
    expect(
      timeline(({ cold }) => concat(cold('(c|)', { c: 'cached' }), cold('----n|', { n: 'fresh' }))),
    ).toEqual(ordered);
    expect(timeline(({ cold }) => cold('----n|', { n: 'fresh' }).pipe(startWith('cached')))).toEqual(ordered);
    // A slow cache and a fast network: the stale value arrives last.
    expect(
      timeline(({ cold }) => merge(cold('------c|', { c: 'cached' }), cold('--n|', { n: 'fresh' }))),
    ).toEqual([
      [2, 'N', 'fresh'],
      [6, 'N', 'cached'],
      [7, 'C'],
    ]);
  });

  it('Section 8: race follows the first source and timeout falls back', () => {
    expect(timeline(({ cold }) => race(cold('-----a|'), cold('--b|')))).toEqual([
      [2, 'N', 'b'],
      [3, 'C'],
    ]);
    // An error that arrives first wins the race too.
    expect(timeline(({ cold }) => race(cold('--#'), cold('-----a|')))).toEqual([[2, 'E', 'error']]);
    const fallback = { with: () => of('fallback') };
    expect(timeline(({ cold }) => cold('------a|').pipe(timeout({ first: 3, ...fallback })))).toEqual([
      [3, 'N', 'fallback'],
      [3, 'C'],
    ]);
    expect(timeline(({ cold }) => cold('-a-----b|').pipe(timeout({ each: 3, ...fallback })))).toEqual([
      [1, 'N', 'a'],
      [4, 'N', 'fallback'],
      [4, 'C'],
    ]);
    expect(timeline(({ cold }) => cold('------a|').pipe(timeout({ first: 3 })))).toEqual([
      [3, 'E', 'TimeoutError'],
    ]);
  });

  it('Section 8: polling pauses while an injected visibility source is false', () => {
    const scheduler = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
    scheduler.run(({ hot, cold, expectObservable }) => {
      // Visible at 0, hidden at 6 (a request started at 5 is in flight), visible again at 16.
      const visible = hot('t-----f---------t', { t: true, f: false });
      TestBed.configureTestingModule({ providers: [{ provide: LAB_M23_VISIBLE, useValue: visible }] });
      const polls = TestBed.runInInjectionContext(() =>
        pollWhileVisible(inject(LAB_M23_VISIBLE), () => cold('--r|')),
      );
      // The poll at 0 answers at 2, the one at 5 is cancelled by the hide, the page resumes at 16 (answers 18, 23).
      expectObservable(polls, '^-----------------------!').toBe('--r---------------r----r', { r: 'r' });
    });
  });

  it('Section 8: the legacy timeoutWith and nested-subscribe forms match their replacements', () => {
    expect(
      timeline(({ cold }) => legacyTimeoutWith(cold('-a-----b|'), 3, of('fallback'))),
    ).toEqual(timeline(({ cold }) => cold('-a-----b|').pipe(timeout({ each: 3, with: () => of('fallback') }))));

    const keystrokes = 'a-b------c----------|';
    const legacy: [number, string][] = [];
    const scheduler = new TestScheduler(() => undefined);
    scheduler.run(({ hot, cold }) => {
      legacyTypeaheadNestedSubscribe(
        hot(keystrokes, TERMS),
        searchFor(cold),
        (result) => legacy.push([scheduler.now(), result]),
        3,
      );
    });
    const modern = timeline(({ hot, cold }) => typeahead(hot(keystrokes, TERMS), searchFor(cold)));
    expect(legacy).toEqual([
      [9, 'R:ang'],
      [16, 'R:angu'],
    ]);
    expect(modern.filter((entry) => entry[1] === 'N').map(([frame, , value]) => [frame, value])).toEqual(legacy);
  });
});
