import { useEffect, useState } from 'react';

/**
 * Returns `value`, but only after it has stopped changing for `delayMs`.
 * Every change restarts the timer, because the effect's cleanup cancels the pending one.
 * @param value - Any value compared with `Object.is` (pass primitives or stable references).
 * @param delayMs - Quiet period in milliseconds.
 * @returns The last value that stayed unchanged for `delayMs`.
 */
export function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs); // setState in a callback, not the effect body
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
