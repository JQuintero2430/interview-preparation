import { useState } from 'react';

/**
 * Returns a brand-new component type on every call. Calling it once at module level is fine.
 * Calling it during render is exactly what "a component defined inside a component" does,
 * which is why `react-hooks/static-components` rejects that code. The test calls it between
 * renders instead, to reproduce the bug without committing lint-failing code.
 */
export function makeCounter() {
  return function Counter() {
    const [count, setCount] = useState(0);
    return <button onClick={() => setCount((c) => c + 1)}>Clicked {count}</button>;
  };
}

/** One type, created once, at module level. */
export const StableCounter = makeCounter();
