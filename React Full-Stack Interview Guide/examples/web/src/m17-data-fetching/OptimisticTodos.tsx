import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useId, useState, type SubmitEvent } from 'react';
import { createTodo, type Todo } from './api';
import { todoKeys, todosQuery } from './queries';

const TEMP_ID_PREFIX = 'temp-';
const listKey = todosQuery().queryKey;

/**
 * Builds the row shown before the server has assigned an id.
 * @param title - What the user typed.
 * @returns A todo whose id marks it as not yet saved.
 */
export function optimisticTodo(title: string): Todo {
  return { id: `${TEMP_ID_PREFIX}${title}`, title, done: false };
}

/**
 * The cache-based optimistic update: write the guess into the cache in onMutate, restore the
 * snapshot in onError, and refetch the truth in onSettled whatever happened.
 */
function useAddTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTodo,
    onMutate: async (title: string) => {
      // A refetch already in flight would land after our write and erase the optimistic row.
      await queryClient.cancelQueries({ queryKey: listKey });
      const previous = queryClient.getQueryData(listKey);
      queryClient.setQueryData(listKey, (old = []) => [...old, optimisticTodo(title)]);
      return { previous };
    },
    onError: (_error, _title, onMutateResult) => {
      queryClient.setQueryData(listKey, onMutateResult?.previous);
    },
    // Returning the promise keeps the mutation pending until the list is fresh again.
    onSettled: () => queryClient.invalidateQueries({ queryKey: todoKeys.all }),
  });
}

export function OptimisticTodos() {
  const inputId = useId();
  const [title, setTitle] = useState('');
  const todos = useQuery(todosQuery());
  const addTodo = useAddTodo();

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    addTodo.mutate(trimmed);
    setTitle('');
  }

  return (
    <section>
      <form onSubmit={handleSubmit}>
        <label htmlFor={inputId}>New todo</label>
        <input id={inputId} value={title} onChange={(e) => setTitle(e.target.value)} />
        <button type="submit">Add</button>
      </form>
      {addTodo.isError && <p role="alert">Could not add "{addTodo.variables}"</p>}
      {todos.status === 'pending' && <p role="status">Loading todos…</p>}
      {todos.status === 'error' && <p role="alert">Could not load todos: {todos.error.message}</p>}
      {todos.data && (
        <ul>
          {todos.data.map((todo) => (
            <li key={todo.id}>
              <span>{todo.title}</span>
              {todo.id.startsWith(TEMP_ID_PREFIX) && <span> (saving…)</span>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
