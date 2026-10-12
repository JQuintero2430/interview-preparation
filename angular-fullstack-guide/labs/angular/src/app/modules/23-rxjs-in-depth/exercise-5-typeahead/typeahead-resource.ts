import { Injectable, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap, timer } from 'rxjs';
import { DEBOUNCE_MS, FALLBACK, SearchApi, normalizeTerm } from './search-api';

/**
 * The typeahead as signals: `query` is the state, `results` the async data. The debounce is in the stream:
 * a new term aborts the previous stream, which cancels its wait or its search. `term` is a `computed` so that
 * `params` re-runs only when the normalized term changes: any signal that `params` reads restarts the stream.
 */
@Injectable()
export class TypeaheadResource {
  readonly #api = inject(SearchApi);
  readonly query = signal('');
  readonly #term = computed(() => normalizeTerm(this.query()));
  readonly results = rxResource({
    params: () => this.#term(),
    stream: ({ params }) =>
      timer(DEBOUNCE_MS).pipe(
        switchMap(() => this.#api.search$(params)),
        catchError(() => of(FALLBACK)),
      ),
  });
}
