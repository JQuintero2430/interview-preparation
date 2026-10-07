// labs/angular/src/app/modules/17-signals/exercise-5-user-search/user-search.ts
import { computed, inject, InjectionToken, resource, Service, signal } from '@angular/core';

export interface User {
  readonly id: number;
  readonly name: string;
}

/** Port to the backend. The real adapter would call HttpClient or fetch and honour the AbortSignal. */
export interface UserSearchApi {
  search(term: string, abortSignal: AbortSignal): Promise<readonly User[]>;
}

export const USER_SEARCH_API = new InjectionToken<UserSearchApi>('USER_SEARCH_API');

export const MIN_TERM_LENGTH = 2;

/** Returning undefined from params puts the resource in the 'idle' state: no request is made. */
export function toSearchTerm(query: string): string | undefined {
  const term = query.trim();
  return term.length >= MIN_TERM_LENGTH ? term : undefined;
}

@Service()
export class UserSearch {
  readonly #api = inject(USER_SEARCH_API);

  readonly query = signal('');

  readonly #results = resource({
    params: () => toSearchTerm(this.query()),
    loader: ({ params, abortSignal }) => this.#api.search(params, abortSignal),
  });

  readonly status = this.#results.status;
  readonly isLoading = this.#results.isLoading;

  // value() throws while the resource is in the 'error' state, so guard with hasValue().
  readonly users = computed(() => (this.#results.hasValue() ? this.#results.value() : []));

  readonly errorMessage = computed(() =>
    this.#results.status() === 'error' ? 'Search failed. Try again.' : null,
  );

  retry(): void {
    this.#results.reload();
  }
}
