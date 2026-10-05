import { useState } from 'react';
import { TodosProvider, useTodos, useTodosDispatch } from './TodosContext';
import type { Todo } from './todosReducer';

// Each component records its renders here so the tests can prove which ones re-rendered.
export const renderLog: string[] = [];

/**
 * The provider receives its children as a prop. When the provider's state changes, those child
 * elements are the same objects as before, so React skips them unless they read a changed context.
 */
export function TodoApp({ initialTodos }: { initialTodos?: Todo[] }) {
  return (
    <TodosProvider initialTodos={initialTodos}>
      <AddTodo />
      <TodoList />
      <TodoStats />
    </TodosProvider>
  );
}

function AddTodo() {
  const dispatch = useTodosDispatch(); // reads ONLY the dispatch context
  const [text, setText] = useState('');
  renderLog.push('AddTodo');

  function add() {
    const trimmed = text.trim();
    if (!trimmed) return;
    dispatch({ type: 'added', text: trimmed });
    setText('');
  }

  return (
    <div>
      <label>
        New to-do <input value={text} onChange={(e) => setText(e.target.value)} />
      </label>
      <button type="button" onClick={add}>
        Add
      </button>
    </div>
  );
}

function TodoList() {
  const todos = useTodos();
  renderLog.push('TodoList');
  return (
    <ul aria-label="To-dos">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}

function TodoItem({ todo }: { todo: Todo }) {
  const dispatch = useTodosDispatch();
  return (
    <li>
      <label>
        <input
          type="checkbox"
          checked={todo.done}
          onChange={() => dispatch({ type: 'toggled', id: todo.id })}
        />
        {todo.text}
      </label>
      <button type="button" aria-label={`Delete ${todo.text}`} onClick={() => dispatch({ type: 'deleted', id: todo.id })}>
        Delete
      </button>
    </li>
  );
}

function TodoStats() {
  const todos = useTodos();
  renderLog.push('TodoStats');
  const remaining = todos.filter((t) => !t.done).length;
  return (
    <p role="status">
      {remaining} of {todos.length} left
    </p>
  );
}
