import { useRef, useState, useTransition, type ChangeEvent } from 'react';

export type SearchFn = (query: string) => Promise<string[]>;

/**
 * A search box built on an async transition.
 *
 * - `query` is the urgent state: the input must echo each keystroke at once.
 * - `results` is the non-urgent state: it is updated inside a transition, so the old list stays
 *   on screen (dimmed) while the new one is fetched, instead of flashing a fallback.
 * - `isPending` stays true until EVERY transition started by this component has finished.
 * - `latestRequest` drops out-of-order responses: the transition API tracks pending state,
 *   it does not order the requests for you.
 */
export function TransitionSearch({ search }: { search: SearchFn }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const latestRequest = useRef(0);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.value;
    const requestId = ++latestRequest.current;
    setQuery(next); // urgent: the controlled input updates synchronously

    startTransition(async () => {
      const found = await search(next);
      if (requestId !== latestRequest.current) return; // a newer keystroke superseded this one
      // After an await the transition scope is gone, so wrap the update again.
      startTransition(() => {
        setResults(found);
      });
    });
  }

  return (
    <div>
      <label>
        Search <input value={query} onChange={handleChange} />
      </label>
      {isPending && <p role="status">Searching…</p>}
      <ul aria-label="Results" aria-busy={isPending} style={{ opacity: isPending ? 0.5 : 1 }}>
        {results.map((result) => (
          <li key={result}>{result}</li>
        ))}
      </ul>
    </div>
  );
}
