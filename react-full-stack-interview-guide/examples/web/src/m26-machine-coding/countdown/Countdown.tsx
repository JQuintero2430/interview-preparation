import { useEffect, useState } from 'react';

const TICK_MS = 250; // ticks faster than 1s so the display never lags a visible second

export function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Timestamp-based countdown. The interval only triggers re-renders; the remaining time is always
 * computed from `endAt - Date.now()`, so throttled background tabs and late ticks cannot drift.
 */
export function Countdown({ seconds }: { seconds: number }) {
  const [remainingMs, setRemainingMs] = useState(seconds * 1000);
  const [endAt, setEndAt] = useState<number | null>(null); // non-null = running
  const done = remainingMs === 0;

  useEffect(() => {
    if (endAt === null) return;
    const id = setInterval(() => {
      const left = Math.max(0, endAt - Date.now());
      setRemainingMs(left);
      if (left === 0) setEndAt(null);
    }, TICK_MS);
    return () => clearInterval(id);
  }, [endAt]);

  const start = () => setEndAt(Date.now() + remainingMs); // Date.now() in a handler is fine; in render it would not be
  function pause() {
    if (endAt === null) return;
    setRemainingMs(Math.max(0, endAt - Date.now()));
    setEndAt(null);
  }
  function reset() {
    setRemainingMs(seconds * 1000);
    setEndAt(null);
  }

  const running = endAt !== null;
  return (
    <div>
      <div role="timer">{formatTime(Math.ceil(remainingMs / 1000))}</div>
      <p role="status">{done ? "Time's up!" : ''}</p>
      <button type="button" onClick={start} disabled={running || done}>
        Start
      </button>
      <button type="button" onClick={pause} disabled={!running}>
        Pause
      </button>
      <button type="button" onClick={reset}>
        Reset
      </button>
    </div>
  );
}
