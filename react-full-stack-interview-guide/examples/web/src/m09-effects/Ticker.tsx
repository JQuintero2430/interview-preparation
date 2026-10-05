import { useEffect, useEffectEvent, useState } from 'react';

type Props = { delayMs: number; step: number };

export function Ticker({ delayMs, step }: Props) {
  const [count, setCount] = useState(0);

  // Reads the latest `step` on every tick without restarting the interval when `step` changes.
  const onTick = useEffectEvent(() => setCount((c) => c + step));

  useEffect(() => {
    const id = setInterval(onTick, delayMs);
    return () => clearInterval(id);
  }, [delayMs]);

  return <p>Count: {count}</p>;
}
