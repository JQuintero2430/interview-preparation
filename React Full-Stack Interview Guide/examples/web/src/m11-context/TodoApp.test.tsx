import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoApp, renderLog } from './TodoApp';
import { useTodos, useTodosDispatch } from './TodosContext';

const initialTodos = [
  { id: 1, text: 'Learn context', done: false },
  { id: 2, text: 'Split state and dispatch', done: false },
];

beforeEach(() => {
  renderLog.length = 0;
});

test('add, toggle and delete through the two contexts', async () => {
  const user = userEvent.setup();
  render(<TodoApp initialTodos={initialTodos} />);
  const list = screen.getByRole('list', { name: 'To-dos' });
  expect(screen.getByRole('status')).toHaveTextContent('2 of 2 left');

  await user.type(screen.getByLabelText('New to-do'), 'Ship it');
  await user.click(screen.getByRole('button', { name: 'Add' }));
  expect(within(list).getAllByRole('listitem')).toHaveLength(3);
  expect(screen.getByLabelText('New to-do')).toHaveValue('');

  await user.click(within(list).getByRole('checkbox', { name: 'Learn context' }));
  expect(screen.getByRole('status')).toHaveTextContent('2 of 3 left');

  await user.click(within(list).getByRole('button', { name: 'Delete Ship it' }));
  expect(within(list).getAllByRole('listitem')).toHaveLength(2);
  expect(screen.getByRole('status')).toHaveTextContent('1 of 2 left');
});

test('an empty draft adds nothing', async () => {
  const user = userEvent.setup();
  render(<TodoApp />);
  await user.click(screen.getByRole('button', { name: 'Add' }));
  expect(screen.queryAllByRole('listitem')).toHaveLength(0);
});

test('mount renders every component once', () => {
  render(<TodoApp initialTodos={initialTodos} />);
  expect(renderLog).toEqual(['AddTodo', 'TodoList', 'TodoStats']);
});

test('toggling a to-do re-renders the state readers but not AddTodo, which reads only dispatch', async () => {
  const user = userEvent.setup();
  render(<TodoApp initialTodos={initialTodos} />);
  renderLog.length = 0;

  await user.click(screen.getByRole('checkbox', { name: 'Learn context' }));
  expect(renderLog).toEqual(['TodoList', 'TodoStats']);
});

test('typing in AddTodo re-renders only AddTodo (its own local state)', async () => {
  const user = userEvent.setup();
  render(<TodoApp initialTodos={initialTodos} />);
  renderLog.length = 0;

  await user.type(screen.getByLabelText('New to-do'), 'ab');
  expect(renderLog).toEqual(['AddTodo', 'AddTodo']);
});

function ReadsState() {
  useTodos();
  return null;
}

function ReadsDispatch() {
  useTodosDispatch();
  return null;
}

test('the guarded hooks throw outside the provider', () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  expect(() => render(<ReadsState />)).toThrow('useTodos must be used inside <TodosProvider>');
  expect(() => render(<ReadsDispatch />)).toThrow('useTodosDispatch must be used inside <TodosProvider>');
  error.mockRestore();
});
