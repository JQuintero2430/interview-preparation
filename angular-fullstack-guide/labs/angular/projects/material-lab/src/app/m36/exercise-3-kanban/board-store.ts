import { Service, inject, signal } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';

export type ColumnId = 'todo' | 'doing' | 'done';

export interface BoardCard {
  readonly id: string;
  readonly title: string;
}

export interface BoardColumn {
  readonly id: ColumnId;
  readonly title: string;
}

export type Board = Readonly<Record<ColumnId, readonly BoardCard[]>>;

/** The columns, left to right. */
export const COLUMNS: readonly BoardColumn[] = [
  { id: 'todo', title: 'To do' },
  { id: 'doing', title: 'In progress' },
  { id: 'done', title: 'Done' },
];

const INITIAL: Board = {
  todo: [
    { id: 'design', title: 'Design' },
    { id: 'build', title: 'Build' },
    { id: 'test', title: 'Test' },
  ],
  doing: [{ id: 'review', title: 'Review' }],
  done: [{ id: 'ship', title: 'Ship' }],
};

export function columnTitle(id: ColumnId): string {
  return COLUMNS.find((column) => column.id === id)?.title ?? id;
}

/** The message every move announces, from the card's new place. */
export function moveMessage(card: BoardCard, column: ColumnId, position: number, size: number): string {
  return `${card.title} moved to ${columnTitle(column)}, position ${position} of ${size}`;
}

/**
 * The board's data. Every move builds new arrays and sets a new board, so the signal notifies; nothing here mutates an array a
 * signal holds. Drops and keyboard moves both end in `move`, and `move` announces, so no move is silent.
 */
@Service()
export class BoardStore {
  private readonly announcer = inject(LiveAnnouncer);

  readonly board = signal<Board>(INITIAL);

  /** Moves a card to `toIndex` of `toColumn` (an index in the destination as it will be after the move). */
  move(cardId: string, toColumn: ColumnId, toIndex: number): void {
    const board = this.board();
    const from = COLUMNS.find((column) => board[column.id].some((card) => card.id === cardId))?.id;
    const card = from ? board[from].find((candidate) => candidate.id === cardId) : undefined;
    if (!from || !card) return;

    const rest = board[from].filter((candidate) => candidate.id !== cardId);
    const target = from === toColumn ? rest : board[toColumn];
    const index = Math.max(0, Math.min(toIndex, target.length));
    const inserted = [...target.slice(0, index), card, ...target.slice(index)];

    this.board.set({ ...board, [from]: rest, [toColumn]: inserted });
    void this.announcer.announce(moveMessage(card, toColumn, index + 1, inserted.length));
  }
}
