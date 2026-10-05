import { useState, type ReactNode } from 'react';

// Every onChange call and every component render writes to this log.
export const log: string[] = [];

function useLogRender(label: string) {
  log.push(label);
}

/** 1) Controlled input whose owner never updates its state. */
export function IgnoredInput() {
  const [text] = useState(''); // the setter was "forgotten"
  return <input aria-label="Ignored" value={text} onChange={(e) => log.push(`onChange ${e.target.value}`)} />;
}

/** 2) `value` with no `onChange`. */
export function ReadOnlyInput() {
  return <input aria-label="Read-only" value="fixed" />;
}

/** 3) Uncontrolled input seeded from a prop. */
export function NameField({ initial }: { initial: string }) {
  return <input aria-label="Name" defaultValue={initial} />;
}

/** 4) A parent with state, one child it creates itself and one child passed in from above. */
export function Counter({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);
  useLogRender(`render Counter ${count}`);
  return (
    <div>
      <button onClick={() => setCount((c) => c + 1)}>Clicked {count}</button>
      <Logged name="inline" />
      {children}
    </div>
  );
}

/** A leaf that only records that it rendered. */
export function Logged({ name }: { name: string }) {
  useLogRender(`render ${name}`);
  return <span>{name}</span>;
}
