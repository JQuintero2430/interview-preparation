import { useState, type ReactNode } from 'react';

// Every component render appends one line here, so tests can assert the exact render order.
export const log: string[] = [];

function useRenderLog(entry: string) {
  log.push(entry);
}

/** Owns the state. Renders two children it creates, plus whatever it receives as `children`. */
export function Counter({ children }: { children?: ReactNode }) {
  const [count, setCount] = useState(0);
  useRenderLog(`Counter ${count}`);

  return (
    <>
      <button onClick={() => setCount(count)}>Set same</button>
      <button onClick={() => setCount((c) => c + 1)}>Increment</button>
      <Display value={count} />
      <Static />
      {children}
    </>
  );
}

function Display({ value }: { value: number }) {
  useRenderLog(`Display ${value}`);
  return <p>Count: {value}</p>;
}

function Static() {
  useRenderLog('Static');
  return <p>I take no props</p>;
}

/** Rendered by the test and passed into Counter as `children`. */
export function Slot() {
  useRenderLog('Slot');
  return <p>Passed in as children</p>;
}
