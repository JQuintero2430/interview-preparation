import { useRef, useState } from 'react';

// A ref is a mutable box React keeps between renders. Writing to it never re-renders.
export function RefCounter() {
  const clicks = useRef(0);
  const [shown, setShown] = useState<number | null>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          clicks.current += 1; // mutate in an event handler: allowed, and no render happens
        }}
      >
        Count silently
      </button>
      <button type="button" onClick={() => setShown(clicks.current)}>
        Show count
      </button>
      <p>{shown === null ? 'Not shown yet' : `Clicked ${shown} times`}</p>
    </>
  );
}
