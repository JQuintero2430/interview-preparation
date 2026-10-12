import {
  Observable,
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  of,
  switchMap,
} from 'rxjs';
import { DEBOUNCE_MS, FALLBACK, normalizeTerm } from './search-api';

/**
 * The typeahead as a pure function from keystrokes to results: wait for a pause, trim and drop short terms,
 * skip a repeated term, switch to the newest search, and let each search recover on its own.
 */
export function typeahead(
  terms$: Observable<string>,
  search: (term: string) => Observable<readonly string[]>,
): Observable<readonly string[]> {
  return terms$.pipe(
    debounceTime(DEBOUNCE_MS),
    map(normalizeTerm),
    filter((term): term is string => term !== undefined),
    distinctUntilChanged(),
    switchMap((term) => search(term).pipe(catchError(() => of(FALLBACK)))),
  );
}

/** The alternative order: trim and drop short terms before the debounce instead of after it. */
export function typeaheadFilterFirst(
  terms$: Observable<string>,
  search: (term: string) => Observable<readonly string[]>,
): Observable<readonly string[]> {
  return terms$.pipe(
    map(normalizeTerm),
    filter((term): term is string => term !== undefined),
    debounceTime(DEBOUNCE_MS),
    distinctUntilChanged(),
    switchMap((term) => search(term).pipe(catchError(() => of(FALLBACK)))),
  );
}
