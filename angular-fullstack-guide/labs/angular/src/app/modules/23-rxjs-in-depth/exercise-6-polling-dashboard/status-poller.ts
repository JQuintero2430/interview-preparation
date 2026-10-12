import { Injectable, InjectionToken, inject } from '@angular/core';
import {
  EMPTY,
  Observable,
  catchError,
  defer,
  distinctUntilChanged,
  exhaustMap,
  repeat,
  retry,
  shareReplay,
  switchMap,
  timer,
} from 'rxjs';
import { VISIBILITY } from './visibility';

/** The polling constants: the spec overrides them through `POLL_CONFIG`. */
export interface PollConfig {
  /** Milliseconds between polls. */
  readonly intervalMs: number;
  /** The wait before the first retry; each later wait doubles it. */
  readonly backoffMs: number;
  /** The most retries of one poll after its first request. */
  readonly retries: number;
}

export const DEFAULT_POLL_CONFIG: PollConfig = { intervalMs: 5000, backoffMs: 1000, retries: 3 };

export const POLL_CONFIG = new InjectionToken<PollConfig>('lab-m23-poll-config', {
  factory: () => DEFAULT_POLL_CONFIG,
});

/** One status request; the spec provides a fake. */
export const STATUS_SOURCE = new InjectionToken<() => Observable<string>>('lab-m23-status-source');

/**
 * One shared poller. Polls tick while the page is visible, a slow request is never overlapped (`exhaustMap`),
 * a failed request is retried with doubling waits, and the last reader leaving stops everything.
 */
@Injectable()
export class StatusPoller {
  readonly #request = inject(STATUS_SOURCE);
  protected readonly config = inject(POLL_CONFIG);
  readonly #visible$ = inject(VISIBILITY);

  readonly status$: Observable<string> = this.#visible$.pipe(
    distinctUntilChanged(),
    switchMap((visible) => (visible ? this.poll(() => this.attempt()) : EMPTY)),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  /** Runs `attempt` on a schedule; each subclass chooses the polling operator. */
  protected poll(attempt: () => Observable<string>): Observable<string> {
    return timer(0, this.config.intervalMs).pipe(exhaustMap(attempt));
  }

  /** One poll: the request with its retries; a poll that still fails is skipped and the next one runs. */
  protected attempt(): Observable<string> {
    const { backoffMs, retries } = this.config;
    return this.#request().pipe(
      retry({
        count: retries,
        delay: (_error, retryNumber) => timer(backoffMs * 2 ** (retryNumber - 1)),
      }),
      catchError(() => EMPTY),
    );
  }
}

/** The alternative: `repeat` with a delay waits one interval after each response instead of ticking on a clock. */
@Injectable()
export class RepeatStatusPoller extends StatusPoller {
  protected override poll(attempt: () => Observable<string>): Observable<string> {
    return defer(attempt).pipe(repeat({ delay: this.config.intervalMs }));
  }
}
