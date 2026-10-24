// Section 4 claims, about our model (board-model.ts), not a framework: after one move or one title edit, how many
// objects and arrays have a new reference in each shape, and that both shapes show the same board.
import {
  denormalize,
  entity,
  moveCardNested,
  moveCardNormalized,
  normalize,
  renameCardNested,
  renameCardNormalized,
  replacedObjects,
  type NestedBoard,
} from './board-model';

const board: NestedBoard = {
  id: 'b1',
  columns: [
    { id: 'todo', title: 'To do', cards: [{ id: 'c1', title: 'Write' }, { id: 'c2', title: 'Test' }] },
    { id: 'doing', title: 'Doing', cards: [{ id: 'c3', title: 'Review' }] },
    { id: 'done', title: 'Done', cards: [{ id: 'c4', title: 'Ship' }] },
  ],
};
const move = { cardId: 'c1', from: 'todo', to: 'doing' };

describe('Section 4: nested and normalized board (our model)', () => {
  it('Section 4: moving a card in the nested shape replaces the board, both columns and their card arrays', () => {
    const after = moveCardNested(board, move);
    // the board, its columns array, two columns and two card arrays; the third column and every card keep theirs
    expect(replacedObjects(board, after)).toBe(6);
    expect(after.columns[2]).toBe(board.columns[2]);
    expect(after.columns[1]?.cards[1]).toBe(board.columns[0]?.cards[0]);
  });

  it('Section 4: moving a card in the normalized shape replaces two column id lists and no card', () => {
    const before = normalize(board);
    const after = moveCardNormalized(before, move);
    // the board, the columns map, two column entities and their two id lists
    expect(replacedObjects(before, after)).toBe(6);
    expect(after.cards).toBe(before.cards);
    expect(entity(after.columns, 'done')).toBe(entity(before.columns, 'done'));
  });

  it('Section 4: editing a title in the normalized shape replaces one card entity', () => {
    const before = normalize(board);
    const after = renameCardNormalized(before, 'c3', 'Reviewed');
    expect(replacedObjects(before, after)).toBe(3); // the board, the cards map, the card
    expect(after.columns).toBe(before.columns);
    expect(replacedObjects(board, renameCardNested(board, 'c3', 'Reviewed'))).toBe(5); // adds a column and its cards array
  });

  it('Section 4: both shapes show the same columns after the same move', () => {
    const nested = moveCardNested(board, move);
    const normalized = moveCardNormalized(normalize(board), move);
    expect(denormalize(normalized)).toEqual(nested);
    expect(denormalize(renameCardNormalized(normalize(board), 'c2', 'X'))).toEqual(renameCardNested(board, 'c2', 'X'));
  });
});
