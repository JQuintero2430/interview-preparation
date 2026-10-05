import { useState, type ReactNode } from 'react';

// Records every render of the expensive tree, so the tests can count them.
export const log: string[] = [];

/** Stands in for a large subtree that does not care about the color. */
export function ExpensiveTree() {
  log.push('ExpensiveTree');
  return <p>I am a very slow component tree.</p>;
}

// ---------------------------------------------------------------------------
// BEFORE: the color state sits above the expensive tree, so every keystroke re-renders it.
// ---------------------------------------------------------------------------

export function ColorPageBefore() {
  const [color, setColor] = useState('red');
  return (
    <div>
      <input aria-label="Color" value={color} onChange={(e) => setColor(e.target.value)} />
      <p style={{ color }}>Hello, world!</p>
      <ExpensiveTree />
    </div>
  );
}

// ---------------------------------------------------------------------------
// FIX 1, move state down: only the part that uses the color owns it.
// ---------------------------------------------------------------------------

export function ColorPageMovedDown() {
  return (
    <div>
      <ColorForm />
      <ExpensiveTree />
    </div>
  );
}

function ColorForm() {
  const [color, setColor] = useState('red');
  return (
    <>
      <input aria-label="Color" value={color} onChange={(e) => setColor(e.target.value)} />
      <p style={{ color }}>Hello, world!</p>
    </>
  );
}

// ---------------------------------------------------------------------------
// FIX 2, lift content up: the wrapper itself needs the color, so the state cannot move below it.
// The expensive tree is created by the caller and passed in as children instead.
// ---------------------------------------------------------------------------

export function ColorPageLiftedContent() {
  return (
    <ColorPicker>
      <ExpensiveTree />
    </ColorPicker>
  );
}

function ColorPicker({ children }: { children: ReactNode }) {
  const [color, setColor] = useState('red');
  return (
    <div style={{ color }}>
      <input aria-label="Color" value={color} onChange={(e) => setColor(e.target.value)} />
      {children}
    </div>
  );
}
