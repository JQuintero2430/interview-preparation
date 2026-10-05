import { useEffect, useState } from 'react';

export type SearchFn = (query: string, signal: AbortSignal) => Promise<string[]>;

type Outcome = { query: string; items: string[]; failed: boolean };

type Props = { search: SearchFn; delayMs?: number };

// Debounce: the returned value only follows `value` after it has been quiet for `delayMs`.
function useDebounced(value: string, delayMs: number): string {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

export function Search({ search, delayMs = 300 }: Props) {
  const [query, setQuery] = useState('');
  const debounced = useDebounced(query.trim(), delayMs);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  useEffect(() => {
    if (!debounced) return;
    const controller = new AbortController();
    search(debounced, controller.signal).then(
      (items) => {
        // The single `outcome` slot would be overwritten by a late answer to an old query, so ignore it.
        if (!controller.signal.aborted) setOutcome({ query: debounced, items, failed: false });
      },
      () => {
        if (!controller.signal.aborted) setOutcome({ query: debounced, items: [], failed: true });
      },
    );
    return () => controller.abort(); // a newer query (or unmount) cancels this one
  }, [debounced, search]);

  // Everything below is derived: an outcome only counts if it answers the CURRENT debounced query.
  const current = outcome?.query === debounced ? outcome : null;

  return (
    <div>
      <input aria-label="Search" value={query} onChange={(e) => setQuery(e.target.value)} />
      {debounced && !current && <p role="status">Searching…</p>}
      {current?.failed && <p role="alert">Search failed</p>}
      {current && !current.failed && current.items.length === 0 && <p>No results</p>}
      {current && current.items.length > 0 && (
        <ul>
          {current.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
