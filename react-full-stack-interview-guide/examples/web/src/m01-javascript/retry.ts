export interface RetryOptions {
  /** Retries AFTER the first attempt: total attempts = retries + 1. */
  retries: number;
  baseDelayMs: number;
  /** Delay multiplier per attempt. Default 2 (exponential). */
  factor?: number;
  maxDelayMs?: number;
  /** Maps the computed delay to the delay actually used, e.g. fullJitter. */
  jitter?: (delayMs: number) => number;
  /** Return false to fail fast (4xx, validation errors...). */
  shouldRetry?: (error: unknown, attempt: number) => boolean;
  signal?: AbortSignal;
}

/** "Full jitter": a random delay in [0, delay). Spreads out a thundering herd. */
export const fullJitter = (delayMs: number): number => Math.random() * delayMs;

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }
    const onAbort = () => {
      clearTimeout(timer);
      reject(signal?.reason);
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

/** Run `task` until it succeeds, retrying with exponential backoff. Throws the LAST error. */
export async function retry<T>(task: (attempt: number) => Promise<T>, options: RetryOptions): Promise<T> {
  const {
    retries,
    baseDelayMs,
    factor = 2,
    maxDelayMs = Infinity,
    jitter = (d: number) => d,
    shouldRetry = () => true,
    signal,
  } = options;

  for (let attempt = 1; ; attempt++) {
    try {
      return await task(attempt);
    } catch (error) {
      if (attempt > retries || !shouldRetry(error, attempt)) throw error;
      const delay = jitter(Math.min(maxDelayMs, baseDelayMs * factor ** (attempt - 1)));
      await sleep(delay, signal);
    }
  }
}
