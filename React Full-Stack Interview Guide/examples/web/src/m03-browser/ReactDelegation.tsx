import { useState, type MouseEvent } from 'react';

/** A button whose React handler optionally stops propagation, and keeps the last synthetic event. */
export function Stopper({
  stop,
  onEvent,
}: {
  stop: boolean;
  onEvent?: (e: MouseEvent<HTMLButtonElement>) => void;
}) {
  const [clicks, setClicks] = useState(0);
  return (
    <button
      onClick={(e) => {
        onEvent?.(e);
        if (stop) e.stopPropagation(); // React 17+: also stops the NATIVE event at the root container
        setClicks((c) => c + 1);
      }}
    >
      clicked {clicks}
    </button>
  );
}
