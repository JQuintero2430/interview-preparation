import { useState } from 'react';

export type Person = { id: number; name: string; role: string; age: number };
type SortKey = 'name' | 'role' | 'age';
type Direction = 'asc' | 'desc';
type Sort = { key: SortKey; direction: Direction } | null;

const COLUMNS: Array<{ key: SortKey; label: string }> = [
  { key: 'name', label: 'Name' },
  { key: 'role', label: 'Role' },
  { key: 'age', label: 'Age' },
];

/** Pure and stable: copies before sorting (never sort props), ties keep their original order. */
export function sortRows(rows: Person[], sort: Sort): Person[] {
  if (!sort) return rows;
  const sign = sort.direction === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    const x = a[sort.key];
    const y = b[sort.key];
    const order = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y));
    return order * sign;
  });
}

export function filterRows(rows: Person[], query: string): Person[] {
  const needle = query.trim().toLowerCase();
  return needle ? rows.filter((r) => `${r.name} ${r.role}`.toLowerCase().includes(needle)) : rows;
}

export function DataTable({ rows }: { rows: Person[] }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort>(null);

  // Pipeline over the source of truth: filter, then sort. Nothing derived is stored.
  const visible = sortRows(filterRows(rows, query), sort);

  // Cycle for one column: none -> ascending -> descending -> none. Another column starts at ascending.
  function cycle(key: SortKey) {
    setSort((current) => {
      if (current?.key !== key) return { key, direction: 'asc' };
      return current.direction === 'asc' ? { key, direction: 'desc' } : null;
    });
  }

  return (
    <div>
      <label>
        Filter
        <input value={query} onChange={(e) => setQuery(e.target.value)} />
      </label>
      <table>
        <caption>People</caption>
        <thead>
          <tr>
            {COLUMNS.map(({ key, label }) => {
              const direction = sort?.key === key ? sort.direction : null;
              return (
                <th
                  key={key}
                  scope="col"
                  aria-sort={direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : 'none'}
                >
                  <button type="button" onClick={() => cycle(key)}>
                    {label}
                    <span aria-hidden="true">{direction === 'asc' ? ' ▲' : direction === 'desc' ? ' ▼' : ''}</span>
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {visible.map((row) => (
            <tr key={row.id}>
              <td>{row.name}</td>
              <td>{row.role}</td>
              <td>{row.age}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {visible.length === 0 && <p>No matching rows</p>}
    </div>
  );
}
