import { useEffect, useRef } from 'react';
import { ChartWidget } from './widget';

export function Chart({ data }: { data: readonly number[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<ChartWidget | null>(null);

  // Lifetime: create the widget once per mount, destroy it on unmount.
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const widget = new ChartWidget(node);
    widgetRef.current = widget;
    return () => {
      widget.destroy();
      widgetRef.current = null;
    };
  }, []);

  // Data: push new data into the existing instance instead of re-creating it.
  useEffect(() => {
    widgetRef.current?.update(data);
  }, [data]);

  // React renders no children here: the widget owns everything inside this div.
  return <div ref={containerRef} data-testid="chart" />;
}
