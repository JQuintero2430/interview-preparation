import { Injectable } from '@angular/core';
import { Observable, of, switchMap, throwError, timer } from 'rxjs';

/** The pause after the last keystroke before a search starts. */
export const DEBOUNCE_MS = 300;

/** A term shorter than this (after trimming) never searches. */
export const MIN_LENGTH = 2;

/** How long the fake search takes to answer. */
export const SEARCH_MS = 50;

/** The one term the fake search rejects. */
export const FAILING_TERM = 'err';

/** What both typeaheads show when a search fails. */
export const FALLBACK: readonly string[] = ['search unavailable'];

/** The trimmed term, or `undefined` when it is too short to search. */
export function normalizeTerm(term: string): string | undefined {
  const trimmed = term.trim();
  return trimmed.length >= MIN_LENGTH ? trimmed : undefined;
}

/** A fake search API: two results after `SEARCH_MS`, or an error for `FAILING_TERM`. Both typeaheads use it. */
@Injectable({ providedIn: 'root' })
export class SearchApi {
  search$(term: string): Observable<readonly string[]> {
    return timer(SEARCH_MS).pipe(
      switchMap(() =>
        term === FAILING_TERM
          ? throwError(() => new Error('search failed'))
          : of([`${term}-1`, `${term}-2`]),
      ),
    );
  }
}
