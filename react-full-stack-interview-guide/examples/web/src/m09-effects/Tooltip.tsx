import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

type Props = { targetTop: number; children: ReactNode };

// Measure, then position, BEFORE the browser paints: no visible jump.
export function Tooltip({ targetTop, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    setHeight(ref.current?.getBoundingClientRect().height ?? 0);
  }, [children]);

  const top = height === 0 ? targetTop : targetTop - height; // place above the target once measured
  return (
    <div ref={ref} role="tooltip" style={{ position: 'absolute', top }}>
      {children}
    </div>
  );
}
