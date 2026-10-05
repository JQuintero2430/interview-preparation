/** Thrown when the deadline passes. Distinct from a caller abort, which keeps its AbortError. */
export class TimeoutError extends Error {
  constructor(readonly timeoutMs: number) {
    super(`Request timed out after ${timeoutMs}ms`);
    this.name = 'TimeoutError';
  }
}

/** Thrown for non-2xx responses: `fetch` itself only rejects on network failure or abort. */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly body: string,
  ) {
    super(`HTTP ${status}`);
    this.name = 'HttpError';
  }
}

export interface FetchJsonOptions extends Omit<RequestInit, 'signal'> {
  /** Deadline for the WHOLE exchange, headers and body. Default 8000. */
  timeoutMs?: number;
  /** The caller's own cancellation (route change, unmount, a newer search). */
  signal?: AbortSignal;
}

/**
 * fetch + JSON with a deadline and caller cancellation.
 * The timeout uses setTimeout + AbortController (not AbortSignal.timeout / AbortSignal.any) so that
 * fake timers control it and so it does not depend on the runtime's AbortSignal statics.
 */
export async function fetchJson<T>(
  url: string,
  { timeoutMs = 8000, signal, ...init }: FetchJsonOptions = {},
): Promise<T> {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  const onCallerAbort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  else signal?.addEventListener('abort', onCallerAbort, { once: true });

  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    if (!res.ok) throw new HttpError(res.status, await res.text());
    return (await res.json()) as T;
  } catch (error) {
    if (timedOut) throw new TimeoutError(timeoutMs);
    throw error; // caller abort (AbortError), network failure (TypeError), HttpError
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onCallerAbort);
  }
}
