import { Injectable, computed, inject, signal } from '@angular/core';
import { Todo, TodoCollection, normalize } from './todo';
import { TodosApi } from './todos-api';

/** The most undo steps kept; older edits fall off the front of `past`. */
export const HISTORY_LIMIT = 20;

/** One toggle as data: the inverse is `from`, the redo is `to`. */
interface Edit {
  readonly id: number;
  readonly from: boolean;
  readonly to: boolean;
}

interface History {
  readonly past: readonly Edit[];
  readonly future: readonly Edit[];
}

@Injectable({ providedIn: 'root' })
export class TodosStore {
  private readonly api = inject(TodosApi);
  private readonly state = signal<TodoCollection>({ ids: [], entities: {} });
  private readonly history = signal<History>({ past: [], future: [] });
  private readonly errorState = signal<string | null>(null);

  readonly collection = this.state.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly todos = computed(() => {
    const { ids, entities } = this.state();
    return ids.flatMap((id) => (entities[id] ? [entities[id]] : []));
  });
  readonly canUndo = computed(() => this.history().past.length > 0);
  readonly canRedo = computed(() => this.history().future.length > 0);

  setAll(todos: readonly Todo[]): void {
    this.state.set(normalize(todos));
    this.history.set({ past: [], future: [] });
  }

  toggle(id: number): void {
    const todo = this.state().entities[id];
    if (!todo) {
      return;
    }
    const edit: Edit = { id, from: todo.done, to: !todo.done };
    this.history.update(({ past }) => ({ past: [...past, edit].slice(-HISTORY_LIMIT), future: [] }));
    this.send(edit, () =>
      this.history.update(({ past, future }) => ({ past: past.filter((e) => e !== edit), future })),
    );
  }

  undo(): void {
    const { past, future } = this.history();
    const edit = past.at(-1);
    if (!edit) {
      return;
    }
    this.history.set({ past: past.slice(0, -1), future: [edit, ...future] });
    this.send({ id: edit.id, from: edit.to, to: edit.from }, () => this.history.set({ past, future }));
  }

  redo(): void {
    const { past, future } = this.history();
    const [edit, ...rest] = future;
    if (!edit) {
      return;
    }
    this.history.set({ past: [...past, edit].slice(-HISTORY_LIMIT), future: rest });
    this.send(edit, () => this.history.set({ past, future }));
  }

  /** Optimistic write; on failure only this item goes back to `from`, then `onFail` fixes the history. */
  private send(edit: Edit, onFail: () => void): void {
    this.errorState.set(null);
    this.setDone(edit.id, edit.to);
    this.api.toggle(edit.id, edit.to).subscribe({
      error: () => {
        this.setDone(edit.id, edit.from);
        onFail();
        this.errorState.set(`could not save todo ${edit.id}`);
      },
    });
  }

  private setDone(id: number, done: boolean): void {
    this.state.update((s) => {
      const current = s.entities[id];
      return current ? { ids: s.ids, entities: { ...s.entities, [id]: { ...current, done } } } : s;
    });
  }
}
