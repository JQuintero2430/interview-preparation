import { useEffect, useState } from 'react';

export type FetchState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

export type FetchResult<T> = FetchState<T> & { refetch: () => void };

// What the server answered, tagged with the request it answers ("url#attempt").
type Settled<T> = { requestKey: string; data: T } | { requestKey: string; error: string };

/**
 * Fetches JSON from `url` and returns a discriminated union describing the request.
 * Race-safe in three ways: the cleanup aborts the old request, aborts are not errors,
 * and the status is derived from whether the stored answer belongs to the current request.
 * @param url - Endpoint to GET, or `null` to stay idle (useful for dependent requests).
 * @returns The current state plus `refetch`, which repeats the request for the same url.
 */
export function useFetch<T>(url: string | null): FetchResult<T> {
  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState<Settled<T> | null>(null);
  const requestKey = `${url}#${attempt}`;

  useEffect(() => {
    if (!url) return;
    const controller = new AbortController();
    const key = `${url}#${attempt}`;

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        // Unchecked cast: validate with a schema (Zod) when the payload is not trusted.
        return res.json() as Promise<T>;
      })
      .then((data) => setSettled({ requestKey: key, data }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return; // superseded or unmounted: not a failure
        setSettled({ requestKey: key, error: error instanceof Error ? error.message : String(error) });
      });

    return () => controller.abort();
  }, [url, attempt]);

  const refetch = () => setAttempt((a) => a + 1);

  if (!url) return { status: 'idle', refetch };
  if (settled?.requestKey !== requestKey) return { status: 'loading', refetch };
  return 'error' in settled
    ? { status: 'error', error: settled.error, refetch }
    : { status: 'success', data: settled.data, refetch };
}
