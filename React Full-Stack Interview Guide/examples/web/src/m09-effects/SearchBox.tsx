import { useState } from 'react';
import { useSearch, type SearchState } from './useSearch';

export function SearchBox() {
  const [query, setQuery] = useState('');
  const search = useSearch(query);

  return (
    <section>
      <label>
        Search
        <input value={query} onChange={(e) => setQuery(e.target.value)} />
      </label>
      <SearchResults state={search} />
    </section>
  );
}

function SearchResults({ state }: { state: SearchState }) {
  switch (state.status) {
    case 'idle':
      return <p>Type to search</p>;
    case 'loading':
      return <p role="status">Loading…</p>;
    case 'error':
      return <p role="alert">Search failed: {state.error}</p>;
    case 'success':
      return state.results.length === 0 ? (
        <p>No results</p>
      ) : (
        <ul>
          {state.results.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      );
  }
}
