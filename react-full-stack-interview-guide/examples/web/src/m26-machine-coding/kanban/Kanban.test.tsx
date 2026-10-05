import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Kanban, moveCard, type Board } from './Kanban';

const board = (): Board => ({
  todo: [
    { id: 'a', title: 'Write tests' },
    { id: 'b', title: 'Fix bug' },
    { id: 'c', title: 'Review PR' },
  ],
  doing: [{ id: 'd', title: 'Deploy' }],
  done: [],
});

const ids = (cards: Board['todo']) => cards.map((c) => c.id);

describe('moveCard', () => {
  test('moves to another column at an index', () => {
    const next = moveCard(board(), 'a', 'doing', 0);
    expect(ids(next.todo)).toEqual(['b', 'c']);
    expect(ids(next.doing)).toEqual(['a', 'd']);
  });

  test('appends to an empty column', () => {
    expect(ids(moveCard(board(), 'b', 'done', 0).done)).toEqual(['b']);
  });

  test('reordering inside a column accounts for the removed card', () => {
    // "before c" is index 2; once a is removed, that slot is index 1.
    expect(ids(moveCard(board(), 'a', 'todo', 2).todo)).toEqual(['b', 'a', 'c']);
    expect(ids(moveCard(board(), 'c', 'todo', 0).todo)).toEqual(['c', 'a', 'b']);
  });

  test('does not mutate the input and ignores unknown ids', () => {
    const original = board();
    moveCard(original, 'a', 'done', 0);
    expect(original).toEqual(board());
    expect(moveCard(original, 'zzz', 'done', 0)).toBe(original);
  });
});

// jsdom has no DataTransfer, so the drag is driven by hand with a minimal stub.
const dataTransfer = () => ({ setData: vi.fn(), getData: vi.fn(), effectAllowed: '', dropEffect: '' });
const li = (title: string) => {
  const element = screen.getByText(title).closest('li');
  if (!element) throw new Error(`no card ${title}`);
  return element;
};
const column = (name: string) => screen.getByRole('region', { name });

test('dragging a card onto another column moves it to the end of that column', () => {
  render(<Kanban initial={board()} />);
  const dt = dataTransfer();

  fireEvent.dragStart(li('Write tests'), { dataTransfer: dt });
  fireEvent.dragOver(column('Doing'), { dataTransfer: dt });
  fireEvent.drop(column('Doing'), { dataTransfer: dt });

  expect(within(column('Doing')).getAllByRole('listitem').map((el) => el.textContent)).toEqual([
    expect.stringContaining('Deploy'),
    expect.stringContaining('Write tests'),
  ]);
  expect(within(column('To do')).queryByText('Write tests')).not.toBeInTheDocument();
  expect(dt.setData).toHaveBeenCalledWith('text/plain', 'a');
});

test('dropping on a card inserts before it; dragover is cancelled so drop can fire', () => {
  render(<Kanban initial={board()} />);
  const dt = dataTransfer();

  fireEvent.dragStart(li('Review PR'), { dataTransfer: dt });
  const notCancelled = fireEvent.dragOver(column('To do'), { dataTransfer: dt });
  expect(notCancelled).toBe(false); // fireEvent returns false when preventDefault was called
  fireEvent.drop(li('Write tests'), { dataTransfer: dt });

  expect(within(column('To do')).getAllByRole('listitem').map((el) => el.textContent)).toEqual([
    expect.stringContaining('Review PR'),
    expect.stringContaining('Write tests'),
    expect.stringContaining('Fix bug'),
  ]);
});

test('the select is a keyboard alternative to dragging', async () => {
  const user = userEvent.setup();
  render(<Kanban initial={board()} />);

  await user.selectOptions(screen.getByRole('combobox', { name: 'Move Fix bug' }), 'Done');
  expect(within(column('Done')).getByText('Fix bug')).toBeInTheDocument();
  expect(within(column('To do')).queryByText('Fix bug')).not.toBeInTheDocument();
});
