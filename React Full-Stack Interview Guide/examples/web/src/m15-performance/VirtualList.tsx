import { useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

export const ROW_HEIGHT = 35;
export const VIEWPORT_HEIGHT = 400;

/**
 * Renders only the rows inside the scroll viewport (plus a few extra above and below),
 * however many rows there are. The inner div is as tall as all rows together, so the
 * scrollbar behaves as if every row were in the DOM.
 */
export function VirtualList({ rows }: { rows: string[] }) {
  // A callback ref into state (instead of useRef) so nothing reads ref.current during render,
  // and the virtualizer re-renders once the element exists.
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(null);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollElement,
    estimateSize: () => ROW_HEIGHT, // fixed height; use measureElement for variable rows
    overscan: 5, // rows rendered beyond each edge, so fast scrolling doesn't flash blank space
  });

  return (
    <div ref={setScrollElement} data-testid="scroller" style={{ height: VIEWPORT_HEIGHT, overflowY: 'auto' }}>
      {/* Positions are computed at runtime from scroll offset, so they are set inline. */}
      <div role="list" aria-label="Rows" style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            role="listitem"
            aria-setsize={rows.length}
            aria-posinset={virtualRow.index + 1}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: virtualRow.size,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {rows[virtualRow.index]}
          </div>
        ))}
      </div>
    </div>
  );
}
