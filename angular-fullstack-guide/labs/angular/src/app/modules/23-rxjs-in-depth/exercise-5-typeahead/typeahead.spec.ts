import { effect } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { countingSource } from '../exercise-3-cache-service/counting-source';
import { DEBOUNCE_MS, FALLBACK, SEARCH_MS, SearchApi } from './search-api';
import { typeahead, typeaheadFilterFirst } from './typeahead-pipeline';
import { TypeaheadResource } from './typeahead-resource';

// The text solution and its filter-first alternative must pass every pipeline test below.
const PIPELINES = {
  'filter after the debounce': typeahead,
  'filter before the debounce': typeaheadFilterFirst,
};

const scheduler = () => new TestScheduler((actual, expected) => expect(actual).toEqual(expected));

/** The results `SearchApi` gives for a term. */
const resultsFor = (term: string): readonly string[] => [`${term}-1`, `${term}-2`];

/** One keystroke script for both versions: `[milliseconds after the previous keystroke, text of the box]`. */
const SCRIPT: [number, string][] = [
  [0, 'a'],
  [100, 'an'],
  [100, ' ang '],
  [800, 'ang'],
  [500, 'err'],
  [1000, 'angu'],
];

/** Mounts the signals version over the given search API. */
function mountResource(api: SearchApi = new SearchApi()) {
  TestBed.configureTestingModule({
    providers: [TypeaheadResource, { provide: SearchApi, useValue: api }],
  });
  return TestBed.inject(TypeaheadResource);
}

describe('E23.5 typeahead twice', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('the pipeline searches the trimmed term 300 ms after the last keystroke and never twice in a row for the same term', () => {
    for (const pipeline of Object.values(PIPELINES)) {
      const api = new SearchApi();
      const searched: string[] = [];
      const search = (term: string) => {
        searched.push(term);
        return api.search$(term);
      };
      scheduler().run(({ hot, expectObservable }) => {
        // `a` is too short; ` ang ` follows `an` within 300 ms; the second `ang` repeats the searched term.
        const terms = hot('a 99ms b 99ms c 799ms d 999ms e 500ms |', {
          a: 'a',
          b: 'an',
          c: ' ang ',
          d: 'ang',
          e: 'angu',
        });
        expectObservable(pipeline(terms, search)).toBe('550ms a 1799ms b 150ms |', {
          a: resultsFor('ang'),
          b: resultsFor('angu'),
        });
      });
      expect(searched).toEqual(['ang', 'angu']);
    }
  });

  it('a newer term unsubscribes the previous search', () => {
    for (const pipeline of Object.values(PIPELINES)) {
      scheduler().run(({ hot, cold, expectObservable, expectSubscriptions }) => {
        const slow = cold('1000ms (r|)', { r: ['slow'] });
        const fast = cold('100ms (r|)', { r: ['fast'] });
        const terms = hot('a 499ms b 499ms |', { a: 'ang', b: 'angu' });
        expectObservable(pipeline(terms, (term) => (term === 'ang' ? slow : fast))).toBe(
          '900ms a 99ms |',
          { a: ['fast'] },
        );
        expectSubscriptions(slow.subscriptions).toBe('300ms ^ 499ms !');
        expectSubscriptions(fast.subscriptions).toBe('800ms ^ 99ms !');
      });
    }
  });

  it('a failing search emits a fallback and the typeahead keeps working for the next term', () => {
    for (const pipeline of Object.values(PIPELINES)) {
      scheduler().run(({ hot, expectObservable }) => {
        const terms = hot('a 999ms b 500ms |', { a: 'err', b: 'angu' });
        expectObservable(pipeline(terms, (term) => new SearchApi().search$(term))).toBe(
          '350ms a 999ms b 150ms |',
          { a: FALLBACK, b: resultsFor('angu') },
        );
      });
    }
  });

  it('the rxResource version reports loading then resolved with the results, and a new query unsubscribes the previous stream', async () => {
    const responses = new Map<string, Subject<readonly string[]>>();
    const sources = new Map<string, ReturnType<typeof countingSource<readonly string[]>>>();
    const api = {
      search$: (term: string) => {
        const response = new Subject<readonly string[]>();
        responses.set(term, response);
        const source = countingSource(() => response);
        sources.set(term, source);
        return source.source$;
      },
    } as SearchApi;
    const typeahead$ = mountResource(api);

    typeahead$.query.set('ang');
    TestBed.tick();
    expect(typeahead$.results.status()).toBe('loading');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
    expect(sources.get('ang')?.counts).toEqual({ subscriptions: 1, teardowns: 0 });

    typeahead$.query.set('angu');
    TestBed.tick();
    expect(sources.get('ang')?.counts).toEqual({ subscriptions: 1, teardowns: 1 });
    expect(typeahead$.results.status()).toBe('loading');
    expect(typeahead$.results.value()).toBeUndefined();

    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
    responses.get('angu')?.next(resultsFor('angu'));
    await vi.advanceTimersByTimeAsync(0);
    expect(typeahead$.results.status()).toBe('resolved');
    expect(typeahead$.results.value()).toEqual(resultsFor('angu'));
  });

  it('the rxResource version waits 300 ms after the last query before it searches, driven with fake timers and TestBed.tick()', async () => {
    const api = new SearchApi();
    const search = vi.spyOn(api, 'search$');
    const typeahead$ = mountResource(api);

    typeahead$.query.set('a');
    TestBed.tick();
    expect(typeahead$.results.status()).toBe('idle');

    for (const term of ['an', 'ang']) {
      typeahead$.query.set(term);
      TestBed.tick();
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS - 1);
      expect(search).not.toHaveBeenCalled();
    }
    expect(typeahead$.results.status()).toBe('loading');

    await vi.advanceTimersByTimeAsync(1);
    expect(search.mock.calls).toEqual([['ang']]);
    await vi.advanceTimersByTimeAsync(SEARCH_MS);
    expect(typeahead$.results.status()).toBe('resolved');
    expect(typeahead$.results.value()).toEqual(resultsFor('ang'));
  });

  it('both versions return the same results for the same keystroke script', async () => {
    const expected = [resultsFor('ang'), FALLBACK, resultsFor('angu')];
    const searchedTerms = [['ang'], ['err'], ['angu']];

    for (const pipeline of Object.values(PIPELINES)) {
      const api = new SearchApi();
      const search = vi.spyOn(api, 'search$');
      const keystrokes = new Subject<string>();
      const fromPipeline: (readonly string[])[] = [];
      pipeline(keystrokes, (term) => api.search$(term)).subscribe((results) =>
        fromPipeline.push(results),
      );
      for (const [wait, text] of SCRIPT) {
        await vi.advanceTimersByTimeAsync(wait);
        keystrokes.next(text);
      }
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS + SEARCH_MS);
      expect(fromPipeline).toEqual(expected);
      expect(search.mock.calls).toEqual(searchedTerms);
    }

    const api = new SearchApi();
    const search = vi.spyOn(api, 'search$');
    const typeahead$ = mountResource(api);
    const fromResource: (readonly string[])[] = [];
    TestBed.runInInjectionContext(() =>
      effect(() => {
        if (typeahead$.results.status() === 'resolved')
          fromResource.push(typeahead$.results.value() ?? []);
      }),
    );
    // Each step waits, lets the effect record a resolved value, then types the next text.
    for (const [wait, text] of SCRIPT) {
      await vi.advanceTimersByTimeAsync(wait);
      TestBed.tick();
      typeahead$.query.set(text);
      TestBed.tick();
    }
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS + SEARCH_MS);
    TestBed.tick();
    expect(fromResource).toEqual(expected);
    expect(search.mock.calls).toEqual(searchedTerms);
  });
});
