import { useRef, useState, type FormEvent } from 'react';

export type Filter = 'all' | 'active' | 'done';
type Item = { id: number; text: string; done: boolean };

const FILTERS: Filter[] = ['all', 'active', 'done'];
const LABEL: Record<Filter, string> = { all: 'All', active: 'Active', done: 'Done' };

// Single source of truth: `items`. The visible list and the counter are derived, never stored.
function visibleItems(items: Item[], filter: Filter): Item[] {
  if (filter === 'active') return items.filter((item) => !item.done);
  if (filter === 'done') return items.filter((item) => item.done);
  return items;
}

export function Todo() {
  const [items, setItems] = useState<Item[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [draft, setDraft] = useState('');
  const nextId = useRef(1); // only read in event handlers, never during render

  function add(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    const id = nextId.current++;
    setItems((prev) => [...prev, { id, text, done: false }]);
    setDraft('');
  }

  const toggle = (id: number) =>
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item)));
  const remove = (id: number) => setItems((prev) => prev.filter((item) => item.id !== id));

  const left = items.filter((item) => !item.done).length;

  return (
    <section aria-label="Todo list">
      <form onSubmit={add}>
        <label>
          New todo
          <input value={draft} onChange={(e) => setDraft(e.target.value)} />
        </label>
        <button type="submit">Add</button>
      </form>

      <div role="group" aria-label="Filter">
        {FILTERS.map((name) => (
          <button key={name} type="button" aria-pressed={filter === name} onClick={() => setFilter(name)}>
            {LABEL[name]}
          </button>
        ))}
      </div>

      <ul>
        {visibleItems(items, filter).map((item) => (
          <li key={item.id}>
            <label>
              <input type="checkbox" checked={item.done} onChange={() => toggle(item.id)} />
              {item.text}
            </label>
            <button type="button" aria-label={`Delete ${item.text}`} onClick={() => remove(item.id)}>
              ×
            </button>
          </li>
        ))}
      </ul>

      <p>{left} left</p>
    </section>
  );
}
