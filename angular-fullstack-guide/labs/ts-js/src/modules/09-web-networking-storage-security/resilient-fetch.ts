// Exercise 09.2: `fetch` that rejects on HTTP errors, times out, honors the caller's signal and retries only what is safe to repeat.

/** A non-2xx response; plain `fetch` resolves for these. */
export class HttpError extends Error {
  constructor(readonly status: number) {
    super(`HTTP ${status}`);
    this.name = 'HttpError';
  }
}

/** One attempt took longer than `timeoutMs`. */
export class TimeoutError extends Error {
  constructor(readonly timeoutMs: number) {
    super(`No response within ${timeoutMs} ms`);
    this.name = 'TimeoutError';
  }
}

export interface FetchJsonOptions {
  /** Default `GET`. */
  readonly method?: string;
  /** Sent as JSON when present. */
  readonly body?: unknown;
  /** Per attempt. Default 10 000. */
  readonly timeoutMs?: number;
  /** Extra attempts after the first. Default 0. */
  readonly retries?: number;
  /** The caller's cancellation. Its reason is what a cancelled call rejects with. */
  readonly signal?: AbortSignal;
  /** Base delay in ms for the first wait. Default 100. */
  readonly baseDelayMs?: number;
  /** Returns a factor in [0, 1] that scales each wait. Default `Math.random`. */
  readonly jitter?: () => number;
  /** Waits `ms`; rejects with the signal's reason if it aborts first. Injected in tests. */
  readonly sleep?: (ms: number, signal?: AbortSignal) => Promise<void>;
}

const IDEMPOTENT = new Set(['GET', 'HEAD', 'OPTIONS', 'PUT', 'DELETE']);
const RETRY_STATUS = new Set([502, 503, 504]);

const defaultSleep = (ms: number, signal?: AbortSignal): Promise<void> =>
  new Promise((resolve, reject) => {
    signal?.throwIfAborted();
    const onAbort = () => (clearTimeout(timer), reject(signal?.reason));
    const timer = setTimeout(() => (signal?.removeEventListener('abort', onAbort), resolve()), ms);
    signal?.addEventListener('abort', onAbort, { once: true });
  });

/** One attempt: the timeout covers the head and the body, and the caller's abort wins over the timeout. */
const attempt = async <T>(url: string, init: RequestInit, timeoutMs: number, signal?: AbortSignal): Promise<T> => {
  const timeout = AbortSignal.timeout(timeoutMs);
  try {
    const response = await fetch(url, { ...init, signal: signal ? AbortSignal.any([signal, timeout]) : timeout });
    if (!response.ok) {
      void response.body?.cancel();
      throw new HttpError(response.status);
    }
    return (await response.json()) as T;
  } catch (error) {
    if (signal?.aborted) throw signal.reason;
    if (timeout.aborted) throw new TimeoutError(timeoutMs);
    throw error;
  }
};

/** A network failure is a `TypeError` from `fetch`; HTTP errors are retried only for 502, 503 and 504. */
const isRetryable = (error: unknown): boolean => error instanceof TypeError || (error instanceof HttpError && RETRY_STATUS.has(error.status));

export const fetchJson = async <T = unknown>(url: string, options: FetchJsonOptions = {}): Promise<T> => {
  const { method = 'GET', body, timeoutMs = 10_000, retries = 0, signal, baseDelayMs = 100, jitter = Math.random, sleep = defaultSleep } = options;
  const init: RequestInit = { method, ...(body === undefined ? {} : { body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }) };
  for (let attemptNumber = 0; ; attemptNumber++) {
    signal?.throwIfAborted();
    try {
      return await attempt<T>(url, init, timeoutMs, signal);
    } catch (error) {
      if (attemptNumber >= retries || !IDEMPOTENT.has(method) || !isRetryable(error)) throw error;
      await sleep(jitter() * baseDelayMs * 2 ** attemptNumber, signal);
    }
  }
};
