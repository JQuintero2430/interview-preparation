import { useState } from 'react';

const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);

/**
 * The page numbers to show, with '…' for skipped runs. Always the same length once there are
 * enough pages, so the control does not jump around while you click through it.
 */
export function getPageItems(page: number, count: number, siblings = 1): Array<number | '…'> {
  const total = siblings * 2 + 5; // first + last + current + 2 gaps + siblings on both sides
  if (count <= total) return range(1, count);

  const left = Math.max(page - siblings, 1);
  const right = Math.min(page + siblings, count);
  const gapLeft = left > 2;
  const gapRight = right < count - 1;
  const edge = siblings * 2 + 3;

  if (!gapLeft) return [...range(1, edge), '…', count];
  if (!gapRight) return [1, '…', ...range(count - edge + 1, count)];
  return [1, '…', ...range(left, right), '…', count];
}

type PaginationProps = { page: number; pageCount: number; onPageChange: (page: number) => void };

/** Presentational and controlled: it owns no state. */
export function Pagination({ page, pageCount, onPageChange }: PaginationProps) {
  return (
    <nav aria-label="Pagination">
      <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Previous
      </button>
      {getPageItems(page, pageCount).map((item, index) =>
        item === '…' ? (
          <span key={`gap-${index}`} aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            aria-label={`Page ${item}`}
            aria-current={item === page ? 'page' : undefined}
            onClick={() => onPageChange(item)}
          >
            {item}
          </button>
        ),
      )}
      <button type="button" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>
        Next
      </button>
    </nav>
  );
}

type ListProps = { items: string[]; pageSize?: number };

export function PaginatedList({ items, pageSize = 5 }: ListProps) {
  const [requested, setRequested] = useState(1);
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(requested, pageCount); // derived clamp: survives the list shrinking
  const slice = items.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <ul>
        {slice.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <Pagination page={page} pageCount={pageCount} onPageChange={setRequested} />
    </div>
  );
}
