import { useState } from 'react';

/**
 * A custom hook: reusable stateful LOGIC. Each component that calls it gets its own state.
 * @param initial - Starting count.
 * @returns The count and an increment function.
 */
export function useCounter(initial = 0) {
  const [count, setCount] = useState(initial);
  const increment = () => setCount((c) => c + 1);
  return { count, increment };
}

/**
 * A button that counts its own clicks through `useCounter`.
 * @param label - Text before the count.
 */
export function Counter({ label }: { label: string }) {
  const { count, increment } = useCounter();
  return (
    <button onClick={increment}>
      {label}: {count}
    </button>
  );
}

/**
 * BROKEN ON PURPOSE: calls a second `useState` only when `withExtra` is true,
 * so the number of hooks changes between renders.
 * @param withExtra - Whether the conditional hook runs.
 */
export function ExtraHook({ withExtra }: { withExtra: boolean }) {
  const [count] = useState(0);
  if (withExtra) {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- deliberately broken for the exercise
    useState('extra');
  }
  return <p>count: {count}</p>;
}

/**
 * BROKEN ON PURPOSE: the same number and type of hooks on every render, but the two
 * branches are different calls that land in the same slot.
 * @param first - Which branch runs.
 */
export function SwappedHook({ first }: { first: boolean }) {
  // eslint-disable-next-line react-hooks/rules-of-hooks -- deliberately broken for the exercise
  const [label] = first ? useState('first') : useState('second');
  return <p>label: {label}</p>;
}
