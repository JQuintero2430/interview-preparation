import { useState } from 'react';
import { useDebounce } from './useDebounce';

/**
 * A search box whose input updates on every keystroke while the query it reports waits for a pause.
 * In a real app the debounced `query` (never `text`) is what drives the fetch.
 * @param delayMs - Quiet period before the query updates.
 */
export function DebouncedSearch({ delayMs = 300 }: { delayMs?: number }) {
  const [text, setText] = useState('');
  const query = useDebounce(text, delayMs);

  return (
    <section>
      <label>
        Search
        <input value={text} onChange={(e) => setText(e.target.value)} />
      </label>
      <p>Searching for: {query || '(nothing yet)'}</p>
    </section>
  );
}
