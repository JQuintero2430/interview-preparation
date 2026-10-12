import { HttpErrorResponse, httpResource } from '@angular/common/http';
import { Component, computed, signal } from '@angular/core';
import { SearchResult, parseSearchResults } from './search-result';

export const SEARCH_URL = '/api/search';

/** The shortest query that is sent; anything shorter leaves the resource idle. */
export const MIN_QUERY_LENGTH = 2;

/** The error mapping layer of this page: one message per failure kind, no HTTP detail in the template. */
export function searchErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) return 'No connection. Check your network and try again.';
    if (error.status >= 500) return 'Search is unavailable right now. Try again later.';
    return `Search failed (status ${error.status}).`;
  }
  return 'The server sent an unexpected response.';
}

@Component({
  selector: 'lab-m27-search-page',
  template: `
    <label>
      Search
      <input #box type="search" [value]="query()" (input)="query.set(box.value)" />
    </label>
    @if (tooShort()) {
      <p class="hint">Type at least {{ minLength }} characters</p>
    } @else if (results.isLoading()) {
      <p class="loading">Searching…</p>
    } @else if (results.status() === 'error') {
      <p class="error">{{ errorMessage() }}</p>
    } @else if (results.value().length === 0) {
      <p class="empty">No results for "{{ query() }}"</p>
    } @else {
      <ul class="results">
        @for (result of results.value(); track result.id) {
          <li>{{ result.title }}</li>
        }
      </ul>
    }
  `,
})
export class LabM27SearchPage {
  protected readonly minLength = MIN_QUERY_LENGTH;
  readonly query = signal('');
  protected readonly tooShort = computed(() => this.query().trim().length < MIN_QUERY_LENGTH);

  /** Eager: every change of `query` re-runs the request function; a pending request is cancelled first. */
  readonly results = httpResource<SearchResult[]>(
    () => (this.tooShort() ? undefined : { url: SEARCH_URL, params: { q: this.query().trim() } }),
    { defaultValue: [], parse: parseSearchResults },
  );

  protected readonly errorMessage = computed(() => searchErrorMessage(this.results.error()));
}

/** Alternative: one `@switch` over `status()` instead of a chain of derived conditions. */
@Component({
  selector: 'lab-m27-search-page-switch',
  template: `
    <label>
      Search
      <input #box type="search" [value]="query()" (input)="query.set(box.value)" />
    </label>
    @switch (results.status()) {
      @case ('idle') {
        <p class="hint">Type at least {{ minLength }} characters</p>
      }
      @case ('loading') {
        <p class="loading">Searching…</p>
      }
      @case ('reloading') {
        <p class="loading">Searching…</p>
      }
      @case ('error') {
        <p class="error">{{ errorMessage() }}</p>
      }
      @default {
        @if (results.value().length === 0) {
          <p class="empty">No results for "{{ query() }}"</p>
        } @else {
          <ul class="results">
            @for (result of results.value(); track result.id) {
              <li>{{ result.title }}</li>
            }
          </ul>
        }
      }
    }
  `,
})
export class LabM27SearchPageSwitch extends LabM27SearchPage {}
