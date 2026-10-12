import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { retry, throwError, timer } from 'rxjs';
import { RETRY_CONFIG } from './retry-config';

/** Set to `true` in a request's context to send it once, whatever the failure. */
export const NO_RETRY = new HttpContextToken<boolean>(() => false);

const SAFE_METHODS: ReadonlySet<string> = new Set(['GET', 'HEAD', 'PUT', 'DELETE', 'OPTIONS']);

function isRetryable(err: unknown): boolean {
  return (
    err instanceof HttpErrorResponse &&
    (err.status === 0 || err.status === 408 || err.status === 429 || (err.status >= 500 && err.status < 600))
  );
}

type DelayFn = (attempt: number, baseMs: number, random: number) => number;

/** Backoff: baseMs × 2^(attempt − 1), scaled by a jitter factor from 0.5 up to 1.5. */
export const backoffMs: DelayFn = (attempt, baseMs, random) =>
  Math.round(baseMs * 2 ** (attempt - 1) * (0.5 + random));

/** Equal jitter: half of the plain backoff, plus a random share of the other half. */
export const equalJitterMs: DelayFn = (attempt, baseMs, random) =>
  Math.round(baseMs * 2 ** (attempt - 1) * (0.5 + 0.5 * random));

function createRetryInterceptor(delayMs: DelayFn): HttpInterceptorFn {
  return (req, next) => {
    const { count, baseMs, random } = inject(RETRY_CONFIG);
    if (!SAFE_METHODS.has(req.method) || req.context.get(NO_RETRY)) return next(req);
    return next(req).pipe(
      retry({
        count,
        delay: (err: unknown, attempt: number) =>
          isRetryable(err) ? timer(delayMs(attempt, baseMs, random())) : throwError(() => err),
      }),
    );
  };
}

export const retryInterceptor: HttpInterceptorFn = createRetryInterceptor(backoffMs);

/** The alternative of Exercise 27.2: same policy, equal jitter. */
export const equalJitterRetryInterceptor: HttpInterceptorFn = createRetryInterceptor(equalJitterMs);
