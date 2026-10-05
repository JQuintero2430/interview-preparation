export type Todo = { id: number; text: string; done: boolean };

export type TodosAction =
  | { type: 'added'; text: string }
  | { type: 'toggled'; id: number }
  | { type: 'deleted'; id: number };

/** Pure reducer: the id is derived from the current list, so the reducer stays deterministic. */
export function todosReducer(todos: Todo[], action: TodosAction): Todo[] {
  switch (action.type) {
    case 'added': {
      const id = todos.reduce((max, t) => Math.max(max, t.id), 0) + 1;
      return [...todos, { id, text: action.text, done: false }];
    }
    case 'toggled':
      return todos.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t));
    case 'deleted':
      return todos.filter((t) => t.id !== action.id);
  }
}
