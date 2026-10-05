import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Todo } from './Todo';

async function addTodo(user: ReturnType<typeof userEvent.setup>, text: string) {
  await user.type(screen.getByLabelText('New todo'), text);
  await user.click(screen.getByRole('button', { name: 'Add' }));
}

test('adds a todo, trims it, clears the input and ignores blank input', async () => {
  const user = userEvent.setup();
  render(<Todo />);

  await addTodo(user, '   ');
  expect(screen.queryByRole('listitem')).not.toBeInTheDocument();

  await addTodo(user, '  Buy milk  ');
  expect(screen.getByRole('checkbox', { name: 'Buy milk' })).toBeInTheDocument();
  expect(screen.getByLabelText('New todo')).toHaveValue('');
  expect(screen.getByText('1 left')).toBeInTheDocument();
});

test('pressing Enter in the input adds the todo (it is a real form)', async () => {
  const user = userEvent.setup();
  render(<Todo />);
  await user.type(screen.getByLabelText('New todo'), 'Walk the dog{Enter}');
  expect(screen.getByRole('checkbox', { name: 'Walk the dog' })).toBeInTheDocument();
});

test('toggling updates the counter, and the filters show the right subset', async () => {
  const user = userEvent.setup();
  render(<Todo />);
  await addTodo(user, 'A');
  await addTodo(user, 'B');
  await user.click(screen.getByRole('checkbox', { name: 'A' }));
  expect(screen.getByText('1 left')).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Active' }));
  expect(screen.getByRole('button', { name: 'Active' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.queryByRole('checkbox', { name: 'A' })).not.toBeInTheDocument();
  expect(screen.getByRole('checkbox', { name: 'B' })).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Done' }));
  expect(screen.getByRole('checkbox', { name: 'A' })).toBeChecked();
  expect(screen.queryByRole('checkbox', { name: 'B' })).not.toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'All' }));
  expect(screen.getAllByRole('checkbox')).toHaveLength(2);
});

test('deleting removes only that item', async () => {
  const user = userEvent.setup();
  render(<Todo />);
  await addTodo(user, 'A');
  await addTodo(user, 'B');
  await user.click(screen.getByRole('button', { name: 'Delete A' }));
  expect(screen.queryByRole('checkbox', { name: 'A' })).not.toBeInTheDocument();
  expect(screen.getByRole('checkbox', { name: 'B' })).toBeInTheDocument();
});
