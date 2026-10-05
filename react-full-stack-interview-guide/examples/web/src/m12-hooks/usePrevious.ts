import { useState } from 'react';

type Tracked<T> = { value: T; previous: T | undefined };

/**
 * Returns the value `value` had before its most recent change, or `undefined` before any change.
 * Lint-clean replacement for the classic ref-based version: it stores the pair in state and
 * adjusts it during render (react.dev, "Storing information from previous renders").
 * Unrelated re-renders do not move it, because it tracks changes, not renders.
 * @param value - Compared with `Object.is`.
 * @returns The previous distinct value.
 */
export function usePrevious<T>(value: T): T | undefined {
  // An object wrapper, so a function `value` is stored as data, not run as an initializer/updater.
  const [tracked, setTracked] = useState<Tracked<T>>({ value, previous: undefined });

  if (!Object.is(tracked.value, value)) {
    // Allowed: conditional, and only this component's own state. React discards this render's
    // output and immediately re-renders with the new state, before touching children.
    setTracked({ value, previous: tracked.value });
    return tracked.value;
  }
  return tracked.previous;
}
