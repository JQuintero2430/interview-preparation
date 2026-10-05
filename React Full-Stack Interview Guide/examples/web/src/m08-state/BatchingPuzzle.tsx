import { Profiler, useState } from 'react';
import { flushSync } from 'react-dom';

type Props = {
  onCommit: (phase: string) => void; // called once per commit of the subtree (React Profiler)
  onLog: (message: string) => void;
};

/** Wraps the puzzle in a <Profiler> so tests can count how many commits each click causes. */
export function BatchingPuzzle({ onCommit, onLog }: Props) {
  return (
    <Profiler id="puzzle" onRender={(_id, phase) => onCommit(phase)}>
      <Puzzle onLog={onLog} />
    </Profiler>
  );
}

function Puzzle({ onLog }: { onLog: (message: string) => void }) {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);

  function valueThreeTimes() {
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
  }

  function updaterThreeTimes() {
    setCount((c) => c + 1);
    setCount((c) => c + 1);
    setCount((c) => c + 1);
  }

  function valueThenUpdater() {
    setCount(count + 5);
    setCount((c) => c + 1);
  }

  function updaterThenValue() {
    setCount((c) => c + 1);
    setCount(count + 5);
  }

  function logAfterSet() {
    setCount(count + 1);
    onLog(`count is ${count}`);
  }

  async function afterAwait() {
    await Promise.resolve();
    setCount((c) => c + 1);
    setFlag((f) => !f);
  }

  function withFlushSync() {
    flushSync(() => setCount((c) => c + 1));
    setFlag((f) => !f);
  }

  return (
    <div>
      <p>Count: {count}</p>
      <p>Flag: {String(flag)}</p>
      <button onClick={valueThreeTimes}>value ×3</button>
      <button onClick={updaterThreeTimes}>updater ×3</button>
      <button onClick={valueThenUpdater}>value then updater</button>
      <button onClick={updaterThenValue}>updater then value</button>
      <button onClick={logAfterSet}>log after set</button>
      <button onClick={afterAwait}>after await</button>
      <button onClick={withFlushSync}>flushSync</button>
    </div>
  );
}
