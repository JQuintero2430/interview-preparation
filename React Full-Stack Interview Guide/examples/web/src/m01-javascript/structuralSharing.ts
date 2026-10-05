export interface Todo {
  readonly id: number;
  readonly done: boolean;
}
export interface AppState {
  readonly user: { readonly name: string; readonly address: { readonly city: string } };
  readonly todos: readonly Todo[];
}

/** Immutable nested update: copy only the spine from the root to the changed leaf. */
export function setCity(state: AppState, city: string): AppState {
  return {
    ...state, // todos: same reference
    user: {
      ...state.user, // name: same primitive
      address: { ...state.user.address, city },
    },
  };
}

/** Immutable array update: copy the array, reuse every untouched item. */
export function toggleTodo(state: AppState, id: number): AppState {
  return {
    ...state,
    todos: state.todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
  };
}
