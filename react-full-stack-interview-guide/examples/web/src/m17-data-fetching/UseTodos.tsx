import { Suspense, use } from 'react';
import { fetchTodos, type Todo } from './api';

const TODOS_CACHE_KEY = 'todos';
// `use` needs the SAME promise on every render. A promise created during render would be new
// each time, so React would suspend forever ("suspended by an uncached promise").
const promiseCache = new Map<string, Promise<Todo[]>>();

/**
 * Returns the one cached promise for the todo list, starting the request on first call.
 * @returns The shared promise; a rejected one stays cached until `clearTodosPromiseCache`.
 */
export function getTodosPromise(): Promise<Todo[]> {
  const cached = promiseCache.get(TODOS_CACHE_KEY);
  if (cached) return cached;
  const promise = fetchTodos();
  promiseCache.set(TODOS_CACHE_KEY, promise);
  return promise;
}

/** Drops the cached promise so the next render fetches again (tests, or after a mutation). */
export function clearTodosPromiseCache(): void {
  promiseCache.clear();
}

function TodoTitles({ todosPromise }: { todosPromise: Promise<Todo[]> }) {
  const todos = use(todosPromise); // suspends until resolved; a rejection goes to an error boundary
  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  );
}

/** Plain React 19 `use(promise)` with a hand-rolled cache: what libraries and frameworks do for you. */
export function UseTodos() {
  return (
    <Suspense fallback={<p role="status">Loading todos…</p>}>
      <TodoTitles todosPromise={getTodosPromise()} />
    </Suspense>
  );
}
