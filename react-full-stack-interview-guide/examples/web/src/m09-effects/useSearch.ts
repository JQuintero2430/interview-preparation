import { useEffect, useState } from 'react';

export const SEARCH_URL = 'https://api.example.test/search';

export type SearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; results: string[] }
  | { status: 'error'; error: string };

type Settled = { query: string; results: string[] } | { query: string; error: string };

export function useSearch(query: string): SearchState {
  // Store what the server answered *for which query*; derive the status during render.
  const [settled, setSettled] = useState<Settled | null>(null);

  useEffect(() => {
    if (!query) return;
    const controller = new AbortController();

    fetch(`${SEARCH_URL}?q=${encodeURIComponent(query)}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<string[]>;
      })
      .then((results) => setSettled({ query, results }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return; // superseded by a newer query: not an error
        setSettled({ query, error: error instanceof Error ? error.message : String(error) });
      });

    return () => controller.abort();
  }, [query]);

  if (!query) return { status: 'idle' };
  if (settled?.query !== query) return { status: 'loading' };
  return 'error' in settled
    ? { status: 'error', error: settled.error }
    : { status: 'success', results: settled.results };
}
