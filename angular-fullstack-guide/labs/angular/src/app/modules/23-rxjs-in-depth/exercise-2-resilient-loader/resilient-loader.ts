import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, defer, finalize, of, retry, timer } from 'rxjs';

/** The most retries after the first request. */
export const MAX_RETRIES = 3;

/** The wait before the first retry; each later wait doubles it. */
export const RETRY_BASE_MS = 1000;

/** The same three waits, written out (used by the alternative loader). */
export const RETRY_DELAYS_MS: readonly number[] = [1000, 2000, 4000];

/** A status of 0 (no response) or 500 and above may succeed later; a 4xx fails the same way again. */
const isRetryable = (error: HttpErrorResponse) => error.status === 0 || error.status >= 500;

@Injectable({ providedIn: 'root' })
export class ResilientLoader {
  readonly #http = inject(HttpClient);
  readonly #active = signal(0);

  /** True while any load is requesting or waiting to retry. */
  readonly loading = computed(() => this.#active() > 0);

  /** Requests the item; a failure that cannot be fixed by waiting, or the last retry, gives `fallback()`. */
  load<T>(id: string, fallback: () => T): Observable<T> {
    return defer(() => {
      this.#active.update((n) => n + 1);
      return this.#http.get<T>(`/api/items/${id}`).pipe(
        retry({
          count: MAX_RETRIES,
          delay: (error: HttpErrorResponse, retryNumber) => this.#wait(error, retryNumber),
        }),
        catchError(() => of(fallback())),
        finalize(() => this.#active.update((n) => n - 1)),
      );
    });
  }

  /** The wait before retry number `retryNumber` (1, 2, 3): milliseconds. */
  protected backoff(retryNumber: number): number {
    return RETRY_BASE_MS * 2 ** (retryNumber - 1);
  }

  #wait(error: HttpErrorResponse, retryNumber: number): Observable<number> {
    if (!isRetryable(error)) {
      throw error;
    }
    return timer(this.backoff(retryNumber));
  }
}

/** The alternative: the waits come from a table instead of a formula. */
@Injectable({ providedIn: 'root' })
export class TableBackoffLoader extends ResilientLoader {
  protected override backoff(retryNumber: number): number {
    return RETRY_DELAYS_MS[retryNumber - 1];
  }
}
