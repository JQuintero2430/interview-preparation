import { useEffect, useState } from 'react';

const DEFAULT_TICK_MS = 1000;

export type Countdown = {
  remaining: number;
  running: boolean;
  done: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
};

/**
 * Counts down from `from` to 0, one step per `tickMs`, once started.
 * @param from - Starting value (seconds, if tickMs is 1000).
 * @param tickMs - Interval between steps.
 * @returns The remaining value, whether a timer is live, whether it hit 0, and start/pause/reset.
 */
export function useCountdown(from: number, tickMs = DEFAULT_TICK_MS): Countdown {
  const [remaining, setRemaining] = useState(from);
  const [started, setStarted] = useState(false);
  // Derived, not stored: the interval exists only while started AND there is time left,
  // so reaching 0 tears the interval down without a setState inside an effect.
  const running = started && remaining > 0;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), tickMs);
    return () => clearInterval(id);
  }, [running, tickMs]);

  return {
    remaining,
    running,
    done: remaining === 0,
    start: () => setStarted(true),
    pause: () => setStarted(false),
    reset: () => {
      setStarted(false);
      setRemaining(from);
    },
  };
}
