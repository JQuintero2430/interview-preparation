import { useState, type DragEvent } from 'react';

export type ColumnId = 'todo' | 'doing' | 'done';
export type Card = { id: string; title: string };
export type Board = Record<ColumnId, Card[]>;

export const COLUMNS: Array<{ id: ColumnId; title: string }> = [
  { id: 'todo', title: 'To do' },
  { id: 'doing', title: 'Doing' },
  { id: 'done', title: 'Done' },
];

/** Pure board update: remove the card wherever it is, then insert it at `index` of `to`. */
export function moveCard(board: Board, cardId: string, to: ColumnId, index: number): Board {
  const from = COLUMNS.find((c) => board[c.id].some((card) => card.id === cardId))?.id;
  const card = from && board[from].find((c) => c.id === cardId);
  if (!from || !card) return board;

  const fromIndex = board[from].findIndex((c) => c.id === cardId);
  // Removing a card above the target index shifts everything after it up by one.
  const target = from === to && fromIndex < index ? index - 1 : index;

  const next: Board = { ...board, [from]: board[from].filter((c) => c.id !== cardId) };
  next[to] = [...next[to].slice(0, target), card, ...next[to].slice(target)];
  return next;
}

export function Kanban({ initial }: { initial: Board }) {
  const [board, setBoard] = useState(initial);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  function drop(to: ColumnId, index: number) {
    if (draggingId) setBoard((b) => moveCard(b, draggingId, to, index));
    setDraggingId(null);
  }

  function onDragStart(event: DragEvent, id: string) {
    event.dataTransfer.setData('text/plain', id); // Firefox will not start a drag without data
    event.dataTransfer.effectAllowed = 'move';
    setDraggingId(id);
  }

  // Without preventDefault in dragover the browser treats the element as a non-target and never fires drop.
  function allowDrop(event: DragEvent) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }

  return (
    <div style={{ display: 'flex', gap: 16 }}>
      {COLUMNS.map((column) => (
        <section
          key={column.id}
          aria-label={column.title}
          onDragOver={allowDrop}
          onDrop={() => drop(column.id, board[column.id].length)} // dropped on empty space: append
        >
          <h3>{column.title}</h3>
          <ul>
            {board[column.id].map((card, index) => (
              <li
                key={card.id}
                draggable
                data-dragging={card.id === draggingId}
                onDragStart={(e) => onDragStart(e, card.id)}
                onDragEnd={() => setDraggingId(null)}
                onDrop={(e) => {
                  e.stopPropagation(); // the card handled it: do not also append via the column
                  drop(column.id, index); // dropped on a card: insert before it
                }}
              >
                <span>{card.title}</span>
                {/* DnD is not keyboard accessible, so every card also gets a plain control. */}
                <select
                  aria-label={`Move ${card.title}`}
                  value={column.id}
                  onChange={(e) => setBoard((b) => moveCard(b, card.id, e.target.value as ColumnId, b[e.target.value as ColumnId].length))}
                >
                  {COLUMNS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
