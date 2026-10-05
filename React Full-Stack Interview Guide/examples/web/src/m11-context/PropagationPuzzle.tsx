import { createContext, memo, use, useState, type ReactNode } from 'react';

// Every component appends to this log while rendering, so the test can show who re-rendered.
export const log: string[] = [];

const CountContext = createContext(-1); // -1 = "no provider above me"
const SettingsContext = createContext({ theme: 'light' });

/** Provides a primitive context (count) and an object context recreated on every render. */
export function Board({ children }: { children?: ReactNode }) {
  const [count, setCount] = useState(0);
  const [other, setOther] = useState(0);
  log.push(`Board count=${count} other=${other}`);

  return (
    <CountContext value={count}>
      {/* A new object literal on every render of Board. */}
      <SettingsContext value={{ theme: 'dark' }}>
        <button type="button" onClick={() => setCount((c) => c + 1)}>
          count
        </button>
        <button type="button" onClick={() => setOther((o) => o + 1)}>
          other
        </button>
        <Plain />
        <MemoStatic />
        <MemoCount />
        <MemoSettings />
        {children}
      </SettingsContext>
    </CountContext>
  );
}

function Plain() {
  log.push('Plain');
  return null;
}

const MemoStatic = memo(function MemoStatic() {
  log.push('MemoStatic');
  return null;
});

const MemoCount = memo(function MemoCount() {
  const count = use(CountContext);
  log.push(`MemoCount ${count}`);
  return <p>Count: {count}</p>;
});

const MemoSettings = memo(function MemoSettings() {
  const { theme } = use(SettingsContext);
  log.push(`MemoSettings ${theme}`);
  return null;
});

/** Passed to Board as `children` by the caller. */
export function Slot() {
  log.push('Slot');
  return null;
}

/** Reads CountContext. Render it with and without a provider above it. */
export function CountReader() {
  const count = use(CountContext);
  log.push(`CountReader ${count}`);
  return <p>Reader sees {count}</p>;
}

/** Renders a provider AND reads the same context itself. */
export function SelfProvider() {
  const count = use(CountContext);
  log.push(`SelfProvider ${count}`);
  return (
    <CountContext value={42}>
      <CountReader />
    </CountContext>
  );
}
