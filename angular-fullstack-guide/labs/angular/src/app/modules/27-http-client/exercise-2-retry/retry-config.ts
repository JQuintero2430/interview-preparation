import { InjectionToken } from '@angular/core';

export interface RetryConfig {
  /** Retries after the first attempt: `count` 3 sends a request at most 4 times. */
  readonly count: number;
  /** Delay before the first retry, before jitter, in milliseconds. */
  readonly baseMs: number;
  /** Source of the jitter, a value from 0 up to 1; a test replaces it with a constant. */
  readonly random: () => number;
}

export const RETRY_CONFIG = new InjectionToken<RetryConfig>('RETRY_CONFIG', {
  providedIn: 'root',
  factory: () => ({ count: 3, baseMs: 200, random: () => Math.random() }),
});
