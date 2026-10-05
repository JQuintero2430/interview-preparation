import { useEffect, useState } from 'react';

export type SearchFn = (query: string, signal: AbortSignal) => Promise<string[]>;

export type TypeaheadState =
  | { status: 'idle'; items: string[]; error: null }
  | { status: 'loading'; items: string[]; error: null }
  | { status: 'ready'; items: string[]; error: null }
  | { status: 'error'; items: string[]; error: string };

// The result remembers WHICH query it answers, so a stale result can never be shown for a newer query.
type Outcome = { query: string; items: string[]; error: string | null };

const IDLE: TypeaheadState = { status: 'idle', items: [], error: null };
const LOADING: TypeaheadState = { status: 'loading', items: [], error: null };

/**
 * Race-safe typeahead query. Debounces, aborts the superseded request, ignores late answers,
 * and derives `status` during render (no setState in the effect body).
 * `search` must be referentially stable (module-level function or useCallback).
 */
export function useTypeaheadResults(query: string, search: SearchFn, delayMs = 250): TypeaheadState {
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const trimmed = query.trim();

  useEffect(() => {
    if (trimmed === '') return;
    const controller = new AbortController();
    let ignore = false;
    const timer = setTimeout(() => {
      new Promise<string[]>((resolve) => resolve(search(trimmed, controller.signal))).then(
        (items) => {
          if (!ignore) setOutcome({ query: trimmed, items, error: null });
        },
        (err: unknown) => {
          if (!ignore) setOutcome({ query: trimmed, items: [], error: err instanceof Error ? err.message : 'Search failed' });
        },
      );
    }, delayMs);
    return () => {
      ignore = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed, search, delayMs]);

  if (trimmed === '') return IDLE;
  if (outcome?.query !== trimmed) return LOADING;
  if (outcome.error !== null) return { status: 'error', items: [], error: outcome.error };
  return { status: 'ready', items: outcome.items, error: null };
}
