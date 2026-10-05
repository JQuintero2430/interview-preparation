import { memo, useCallback, useMemo, useState } from 'react';

export type Item = { id: number; label: string };

/** Builds `count` items with ids 1..count. Pure, so tests and components get identical data. */
export function makeItems(count: number): Item[] {
  return Array.from({ length: count }, (_, i) => ({ id: i + 1, label: `Item ${i + 1}` }));
}

// Instrumentation for the tests: which rows rendered, and how often the filter ran.
export const rowLog: number[] = [];
export const filterLog: string[] = [];

/** Stands in for an expensive derivation (sorting, grouping, formatting thousands of rows). */
function filterItems(items: Item[], query: string): Item[] {
  filterLog.push(query);
  const q = query.trim().toLowerCase();
  return q ? items.filter((item) => item.label.toLowerCase().includes(q)) : items;
}

// ---------------------------------------------------------------------------
// BEFORE: every state change re-filters and re-renders every row.
// ---------------------------------------------------------------------------

export function SlowList({ items }: { items: Item[] }) {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [dark, setDark] = useState(false);
  const visible = filterItems(items, query); // runs on every render, including theme toggles

  return (
    <div className={dark ? 'theme-dark' : 'theme-light'}>
      <label>
        Filter <input value={query} onChange={(e) => setQuery(e.target.value)} />
      </label>
      <button type="button" onClick={() => setDark((d) => !d)}>
        Toggle theme
      </button>
      <ul aria-label="Items">
        {visible.map((item) => (
          <SlowRow
            key={item.id}
            item={item}
            selectedId={selectedId} // every row gets the id, so every row changes when it changes
            onSelect={(id) => setSelectedId((cur) => (cur === id ? null : id))} // new function per row per render
          />
        ))}
      </ul>
    </div>
  );
}

function SlowRow({
  item,
  selectedId,
  onSelect,
}: {
  item: Item;
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  rowLog.push(item.id);
  return (
    <li>
      <button type="button" aria-pressed={item.id === selectedId} onClick={() => onSelect(item.id)}>
        {item.label}
      </button>
    </li>
  );
}

// ---------------------------------------------------------------------------
// AFTER: the same UI. Only the rows whose props changed re-render.
// ---------------------------------------------------------------------------

export function FastList({ items }: { items: Item[] }) {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [dark, setDark] = useState(false);

  // 1. Re-filter only when the inputs of the filter change, not on a theme toggle.
  const visible = useMemo(() => filterItems(items, query), [items, query]);

  // 2. One stable handler for every row. The functional update means it needs no dependencies.
  const select = useCallback((id: number) => setSelectedId((cur) => (cur === id ? null : id)), []);

  return (
    <div className={dark ? 'theme-dark' : 'theme-light'}>
      <label>
        Filter <input value={query} onChange={(e) => setQuery(e.target.value)} />
      </label>
      <button type="button" onClick={() => setDark((d) => !d)}>
        Toggle theme
      </button>
      <ul aria-label="Items">
        {visible.map((item) => (
          // 3. Pass a boolean, not the selected id, so only two rows' props change on a selection.
          <FastRow key={item.id} item={item} selected={item.id === selectedId} onSelect={select} />
        ))}
      </ul>
    </div>
  );
}

// 4. memo: skip the row when item (same object), selected (same boolean) and onSelect (stable) are equal.
const FastRow = memo(function FastRow({
  item,
  selected,
  onSelect,
}: {
  item: Item;
  selected: boolean;
  onSelect: (id: number) => void;
}) {
  rowLog.push(item.id);
  return (
    <li>
      <button type="button" aria-pressed={selected} onClick={() => onSelect(item.id)}>
        {item.label}
      </button>
    </li>
  );
});
