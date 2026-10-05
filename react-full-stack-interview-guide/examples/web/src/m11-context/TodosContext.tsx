import { createContext, use, useReducer, type Dispatch, type ReactNode } from 'react';
import { todosReducer, type Todo, type TodosAction } from './todosReducer';

// Two contexts on purpose: components that only dispatch never re-render when the list changes,
// because `dispatch` from useReducer has a stable identity for the provider's whole life.
const TodosContext = createContext<Todo[] | null>(null);
const TodosDispatchContext = createContext<Dispatch<TodosAction> | null>(null);

/** Owns the to-do list (reducer) and provides the state and the dispatch function separately. */
export function TodosProvider({
  initialTodos = [],
  children,
}: {
  initialTodos?: Todo[];
  children: ReactNode;
}) {
  const [todos, dispatch] = useReducer(todosReducer, initialTodos);
  return (
    <TodosContext value={todos}>
      <TodosDispatchContext value={dispatch}>{children}</TodosDispatchContext>
    </TodosContext>
  );
}

/** The current list. Re-renders the caller whenever the list changes. */
export function useTodos(): Todo[] {
  const todos = use(TodosContext);
  if (todos === null) throw new Error('useTodos must be used inside <TodosProvider>');
  return todos;
}

/** The stable dispatch function. Never re-renders the caller by itself. */
export function useTodosDispatch(): Dispatch<TodosAction> {
  const dispatch = use(TodosDispatchContext);
  if (dispatch === null) throw new Error('useTodosDispatch must be used inside <TodosProvider>');
  return dispatch;
}
