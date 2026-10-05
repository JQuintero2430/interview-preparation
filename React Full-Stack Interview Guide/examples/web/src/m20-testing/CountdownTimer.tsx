import { useCountdown } from './useCountdown';

/** Start/pause/reset countdown. The finished message is a status so screen readers announce it. */
export function CountdownTimer({ seconds }: { seconds: number }) {
  const { remaining, running, done, start, pause, reset } = useCountdown(seconds);

  return (
    <section aria-label="Countdown">
      <p role="timer">{remaining}s</p>
      {running ? (
        <button type="button" onClick={pause}>
          Pause
        </button>
      ) : (
        <button type="button" onClick={start} disabled={done}>
          Start
        </button>
      )}
      <button type="button" onClick={reset}>
        Reset
      </button>
      {done && <p role="status">Time's up!</p>}
    </section>
  );
}
