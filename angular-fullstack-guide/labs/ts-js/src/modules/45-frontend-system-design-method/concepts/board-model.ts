// Section 4 model: one board in two client-side shapes and the object references an update replaces. Our model, not
// NgRx's or Angular's code; it mirrors the nested and normalized shapes of module 28 section 10 (owner: 28 §10, which
// reads @ngrx/entity). Updates are immutable: an unchanged part keeps its reference, which is what change detection and
// memoized selectors compare. No framework, no clock, no network.

export interface Card {
  readonly id: string;
  readonly title: string;
}
export interface Column {
  readonly id: string;
  readonly title: string;
  readonly cards: readonly Card[];
}
/** The shape an API usually returns: columns contain their cards. */
export interface NestedBoard {
  readonly id: string;
  readonly columns: readonly Column[];
}
export interface ColumnEntity {
  readonly id: string;
  readonly title: string;
  readonly cardIds: readonly string[];
}
/** Ids and entity maps, as in a relational schema. */
export interface NormalizedBoard {
  readonly id: string;
  readonly columnIds: readonly string[];
  readonly columns: Readonly<Record<string, ColumnEntity>>;
  readonly cards: Readonly<Record<string, Card>>;
}

export interface Move {
  readonly cardId: string;
  readonly from: string;
  readonly to: string;
}

/** Lookup that fails loudly: a missing id is a bug in the caller, not a value. */
export function entity<T>(map: Readonly<Record<string, T>>, id: string): T {
  const found = map[id];
  if (found === undefined) {
    throw new Error(`unknown id ${id}`);
  }
  return found;
}

export function normalize(board: NestedBoard): NormalizedBoard {
  const columns: Record<string, ColumnEntity> = {};
  const cards: Record<string, Card> = {};
  for (const column of board.columns) {
    columns[column.id] = { id: column.id, title: column.title, cardIds: column.cards.map((card) => card.id) };
    for (const card of column.cards) {
      cards[card.id] = card;
    }
  }
  return { id: board.id, columnIds: board.columns.map((column) => column.id), columns, cards };
}

/** The join a selector does in memory: ids back to cards. */
export function denormalize(board: NormalizedBoard): NestedBoard {
  const columns = board.columnIds.map((columnId) => {
    const { id, title, cardIds } = entity(board.columns, columnId);
    return { id, title, cards: cardIds.map((cardId) => entity(board.cards, cardId)) };
  });
  return { id: board.id, columns };
}

export function moveCardNested(board: NestedBoard, { cardId, from, to }: Move): NestedBoard {
  const card = board.columns.find((column) => column.id === from)?.cards.find((c) => c.id === cardId);
  if (!card) {
    return board;
  }
  const columns = board.columns.map((column) => {
    if (column.id === from) {
      return { ...column, cards: column.cards.filter((c) => c.id !== cardId) };
    }
    return column.id === to ? { ...column, cards: [...column.cards, card] } : column;
  });
  return { ...board, columns };
}

export function moveCardNormalized(board: NormalizedBoard, { cardId, from, to }: Move): NormalizedBoard {
  const source = entity(board.columns, from);
  const target = entity(board.columns, to);
  if (!source.cardIds.includes(cardId)) {
    return board;
  }
  const columns = {
    ...board.columns,
    [from]: { ...source, cardIds: source.cardIds.filter((id) => id !== cardId) },
    [to]: { ...target, cardIds: [...target.cardIds, cardId] },
  };
  return { ...board, columns };
}

export function renameCardNested(board: NestedBoard, cardId: string, title: string): NestedBoard {
  const columns = board.columns.map((column) =>
    column.cards.some((card) => card.id === cardId)
      ? { ...column, cards: column.cards.map((card) => (card.id === cardId ? { ...card, title } : card)) }
      : column,
  );
  return { ...board, columns };
}

export function renameCardNormalized(board: NormalizedBoard, cardId: string, title: string): NormalizedBoard {
  return { ...board, cards: { ...board.cards, [cardId]: { ...entity(board.cards, cardId), title } } };
}

function collectObjects(value: unknown, into: Set<object>): Set<object> {
  if (typeof value !== 'object' || value === null || into.has(value)) {
    return into;
  }
  into.add(value);
  for (const child of Object.values(value)) {
    collectObjects(child, into);
  }
  return into;
}

/** Objects and arrays reachable from `after` whose reference is not reachable from `before`. */
export function replacedObjects(before: object, after: object): number {
  const old = collectObjects(before, new Set());
  return [...collectObjects(after, new Set())].filter((value) => !old.has(value)).length;
}
