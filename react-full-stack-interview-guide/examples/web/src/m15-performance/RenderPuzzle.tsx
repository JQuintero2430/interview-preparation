import { PureComponent, memo, useCallback, useState, type CSSProperties, type ReactNode } from 'react';

// Every component appends to this log while rendering, so the test can show exactly who re-rendered.
export const log: string[] = [];

// Created once, at module level: the same object on every render of Parent.
const HOISTED_STYLE: CSSProperties = { color: 'teal' };

/** Owns one piece of state and renders one child of each kind. */
export function Parent({ children }: { children?: ReactNode }) {
  const [count, setCount] = useState(0);
  const stablePick = useCallback(() => {
    log.push('picked');
  }, []);
  log.push(`Parent ${count}`);

  return (
    <div>
      <button type="button" onClick={() => setCount((c) => c + 1)}>
        increment
      </button>
      <Plain />
      <MemoNoProps />
      <MemoWithStyle label="inline style" style={{ color: 'teal' }} />
      <MemoWithStyle label="hoisted style" style={HOISTED_STYLE} />
      <MemoWithHandler label="inline handler" onPick={() => log.push('picked')} />
      <MemoWithHandler label="stable handler" onPick={stablePick} />
      <MemoWithChildren>
        <b>bold</b>
      </MemoWithChildren>
      <PureLegacy label="pure class" />
      {children}
    </div>
  );
}

function Plain() {
  log.push('Plain');
  return null;
}

const MemoNoProps = memo(function MemoNoProps() {
  log.push('MemoNoProps');
  return null;
});

const MemoWithStyle = memo(function MemoWithStyle({ label, style }: { label: string; style: CSSProperties }) {
  log.push(`MemoWithStyle ${label}`);
  return <span style={style}>{label}</span>;
});

const MemoWithHandler = memo(function MemoWithHandler({ label, onPick }: { label: string; onPick: () => void }) {
  log.push(`MemoWithHandler ${label}`);
  return (
    <button type="button" onClick={onPick}>
      {label}
    </button>
  );
});

// `children` is a prop like any other, and <b>bold</b> is a new element object on every Parent render.
const MemoWithChildren = memo(function MemoWithChildren({ children }: { children: ReactNode }) {
  log.push('MemoWithChildren');
  return <p>{children}</p>;
});

// The class-era equivalent of memo: a shallow comparison of props and state.
class PureLegacy extends PureComponent<{ label: string }> {
  render() {
    log.push(`PureLegacy ${this.props.label}`);
    return null;
  }
}

/** Passed to Parent as `children` by the caller, so Parent never creates this element. */
export function Slot() {
  log.push('Slot');
  return null;
}

// A custom comparator that "optimizes" by ignoring the function prop. This is the bug react.dev warns about.
const MemoIgnoresHandler = memo(
  function MemoIgnoresHandler({ label, onReport }: { label: string; onReport: () => void }) {
    return (
      <button type="button" onClick={onReport}>
        {label}
      </button>
    );
  },
  (prev, next) => prev.label === next.label,
);

/** Shows what a comparator that skips function props does to the closure the child keeps. */
export function StaleReport() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <button type="button" onClick={() => setCount((c) => c + 1)}>
        add
      </button>
      <p>count is {count}</p>
      <MemoIgnoresHandler label="report" onReport={() => log.push(`report sees ${count}`)} />
    </div>
  );
}
