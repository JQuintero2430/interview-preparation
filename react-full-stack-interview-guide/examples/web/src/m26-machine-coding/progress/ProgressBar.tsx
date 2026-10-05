import { useEffect, useEffectEvent, useState } from 'react';

type BarProps = { value: number; max?: number; label: string };

/** Presentational: clamps the value and exposes the ARIA progressbar contract. */
export function ProgressBar({ value, max = 100, label }: BarProps) {
  const clamped = Math.min(max, Math.max(0, value));
  const percent = Math.round((clamped / max) * 100);
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={clamped}>
      <div style={{ width: `${percent}%`, height: 8, background: 'currentColor' }} />
    </div>
  );
}

type AutoProps = { durationMs: number; tickMs?: number; onDone?: () => void };

/** Fills over `durationMs`; Start / Pause / Reset. Elapsed time is the only state. */
export function AutoProgress({ durationMs, tickMs = 100, onDone }: AutoProps) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const done = elapsed >= durationMs;
  const notifyDone = useEffectEvent(() => onDone?.());

  useEffect(() => {
    if (!running || done) return; // nothing to schedule: derived, no setState here
    const id = setInterval(() => setElapsed((e) => Math.min(durationMs, e + tickMs)), tickMs);
    return () => clearInterval(id);
  }, [running, done, durationMs, tickMs]);

  useEffect(() => {
    if (done) notifyDone();
  }, [done]);

  function press() {
    if (done) {
      setElapsed(0);
      setRunning(false);
    } else {
      setRunning((r) => !r);
    }
  }

  return (
    <div>
      <ProgressBar label="Progress" value={elapsed} max={durationMs} />
      <p>{Math.round((elapsed / durationMs) * 100)}%</p>
      <button type="button" onClick={press}>
        {done ? 'Reset' : running ? 'Pause' : 'Start'}
      </button>
    </div>
  );
}
