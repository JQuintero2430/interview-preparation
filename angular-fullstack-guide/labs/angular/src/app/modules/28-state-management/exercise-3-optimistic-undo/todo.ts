export interface Todo {
  readonly id: number;
  readonly title: string;
  readonly done: boolean;
}

/** Normalized collection: the order in `ids`, the data in an id-keyed map. */
export interface TodoCollection {
  readonly ids: readonly number[];
  readonly entities: Readonly<Record<number, Todo>>;
}

export function normalize(todos: readonly Todo[]): TodoCollection {
  return {
    ids: todos.map((todo) => todo.id),
    entities: Object.fromEntries(todos.map((todo) => [todo.id, todo])),
  };
}
