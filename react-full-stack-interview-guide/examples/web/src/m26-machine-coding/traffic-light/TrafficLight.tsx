import { useEffect, useState } from 'react';

export type Light = 'red' | 'green' | 'yellow';

/** The state machine as data: each state knows how long it lasts and what comes next. */
export const DEFAULT_CYCLE: Record<Light, { next: Light; ms: number }> = {
  red: { next: 'green', ms: 4000 },
  green: { next: 'yellow', ms: 3000 },
  yellow: { next: 'red', ms: 1000 },
};

const LIGHTS: Light[] = ['red', 'yellow', 'green'];

export function TrafficLight({ cycle = DEFAULT_CYCLE }: { cycle?: typeof DEFAULT_CYCLE }) {
  const [light, setLight] = useState<Light>('red');
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running) return;
    // One timeout per state, not one interval: durations differ, and the cleanup cancels it on pause/unmount.
    const id = setTimeout(() => setLight(cycle[light].next), cycle[light].ms);
    return () => clearTimeout(id);
  }, [light, running, cycle]);

  return (
    <div>
      <div aria-hidden="true">
        {LIGHTS.map((color) => (
          <span key={color} data-color={color} data-lit={color === light} style={{ color: color === light ? color : 'gray' }}>
            ●
          </span>
        ))}
      </div>
      <p role="status">Light: {light}</p>
      <button type="button" onClick={() => setRunning((r) => !r)}>
        {running ? 'Pause' : 'Resume'}
      </button>
    </div>
  );
}
