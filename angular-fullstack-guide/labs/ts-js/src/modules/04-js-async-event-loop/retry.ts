// labs/ts-js/src/modules/04-js-async-event-loop/retry.ts
// Exercise 04.3: retry an async operation with exponential backoff, cancellable with an AbortSignal.
import { delay } from './delay';

const DEFAULT_FACTOR = 2;

export interface RetryOptions {
  /** Extra attempts after the first one. `retries: 2` means at most 3 calls. */
  readonly retries: number;
  /** Wait before the first retry, in milliseconds. */
  readonly baseDelayMs: number;
  /** Multiplier applied to the wait after each failed retry. Defaults to 2. */
  readonly factor?: number;
  /** Upper bound for any single wait. Defaults to no bound. */
  readonly maxDelayMs?: number;
  /** Cancels the retry loop, including a wait in progress. Also passed to the operation. */
  readonly signal?: AbortSignal;
  /** Return false to stop retrying for this error (for example a 4xx response). */
  readonly shouldRetry?: (error: unknown, attempt: number) => boolean;
}

/**
 * Computes the wait before retry number `attempt` (0-based): base * factor^attempt, capped at max.
 */
export function backoffDelay(attempt: number, baseDelayMs: number, factor: number, maxDelayMs: number): number {
  return Math.min(baseDelayMs * factor ** attempt, maxDelayMs);
}

/**
 * Calls `operation` until it fulfils, it fails with a non-retryable error, the retries run out
 * (the last error is rethrown), or `signal` aborts (rejects with `signal.reason`).
 * The operation receives the 0-based attempt number and the signal, so it can cancel its own work.
 */
export async function retry<T>(
  operation: (attempt: number, signal?: AbortSignal) => Promise<T>,
  options: RetryOptions,
): Promise<T> {
  const { retries, baseDelayMs, signal } = options;
  const factor = options.factor ?? DEFAULT_FACTOR;
  const maxDelayMs = options.maxDelayMs ?? Number.POSITIVE_INFINITY;
  const shouldRetry = options.shouldRetry ?? (() => true);

  for (let attempt = 0; ; attempt++) {
    signal?.throwIfAborted();
    try {
      // `return await`, not `return`: without the await, a rejection would skip this catch.
      return await operation(attempt, signal);
    } catch (error) {
      if (attempt >= retries || !shouldRetry(error, attempt)) throw error;
      await delay(backoffDelay(attempt, baseDelayMs, factor, maxDelayMs), signal);
    }
  }
}
