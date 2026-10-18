import { Injectable, computed, inject, signal } from '@angular/core';
import { Todo, TodoCollection, normalize } from './todo';
import { TodosApi } from './todos-api';
import { HISTORY_LIMIT } from './todos-store';

/** One toggle in the history: undo sends `from`, redo sends `to`. */
interface Edit {
  readonly id: number;
  readonly from: boolean;
  readonly to: boolean;
}

interface History {
  readonly past: readonly Edit[];
  readonly future: readonly Edit[];
}

/** A write the server has not answered yet; its object identity is its token. */
interface Pending {
  readonly id: number;
  readonly done: boolean;
}

function withDone(collection: TodoCollection, id: number, done: boolean): TodoCollection {
  const current = collection.entities[id];
  if (!current) {
    return collection;
  }
  return { ids: collection.ids, entities: { ...collection.entities, [id]: { ...current, done } } };
}

/**
 * Alternative to `TodosStore`: the server-confirmed collection and the unanswered writes are kept apart,
 * and the visible collection is derived from both. A failed write is dropped from the overlay instead of
 * having its `from` written back, so a rollback never touches the confirmed state.
 */
@Injectable({ providedIn: 'root' })
export class LabM28OverlayTodosStore {
  private readonly api = inject(TodosApi);
  private readonly confirmed = signal<TodoCollection>({ ids: [], entities: {} });
  private readonly pending = signal<readonly Pending[]>([]);
  private readonly history = signal<History>({ past: [], future: [] });
  private readonly errorState = signal<string | null>(null);

  /** Confirmed state with the pending writes applied in order; with none pending it is `confirmed` itself. */
  readonly collection = computed(() =>
    this.pending().reduce((state, write) => withDone(state, write.id, write.done), this.confirmed()),
  );
  readonly error = this.errorState.asReadonly();
  readonly todos = computed(() => {
    const { ids, entities } = this.collection();
    return ids.flatMap((id) => (entities[id] ? [entities[id]] : []));
  });
  readonly canUndo = computed(() => this.history().past.length > 0);
  readonly canRedo = computed(() => this.history().future.length > 0);

  /** Replaces the confirmed collection and clears the overlay and the history. */
  setAll(todos: readonly Todo[]): void {
    this.confirmed.set(normalize(todos));
    this.pending.set([]);
    this.history.set({ past: [], future: [] });
  }

  /** Flips one todo optimistically and records the edit; a new edit empties the redo stack. */
  toggle(id: number): void {
    const todo = this.collection().entities[id];
    if (!todo) {
      return;
    }
    const edit: Edit = { id, from: todo.done, to: !todo.done };
    this.history.update(({ past }) => ({ past: [...past, edit].slice(-HISTORY_LIMIT), future: [] }));
    this.send(id, edit.to, () =>
      this.history.update(({ past, future }) => ({ past: past.filter((e) => e !== edit), future })),
    );
  }

  /** Sends the last edit's `from` and moves the edit to the redo stack. */
  undo(): void {
    const { past, future } = this.history();
    const edit = past.at(-1);
    if (!edit) {
      return;
    }
    this.history.set({ past: past.slice(0, -1), future: [edit, ...future] });
    this.send(edit.id, edit.from, () => this.history.set({ past, future }));
  }

  /** Sends the next undone edit's `to` and moves it back to the undo stack. */
  redo(): void {
    const { past, future } = this.history();
    const [edit, ...rest] = future;
    if (!edit) {
      return;
    }
    this.history.set({ past: [...past, edit].slice(-HISTORY_LIMIT), future: rest });
    this.send(edit.id, edit.to, () => this.history.set({ past, future }));
  }

  /** Adds an overlay entry; success folds it into `confirmed`, failure only removes it. */
  private send(id: number, done: boolean, onFail: () => void): void {
    const write: Pending = { id, done };
    this.errorState.set(null);
    this.pending.update((writes) => [...writes, write]);
    this.api.toggle(id, done).subscribe({
      // The sent value is confirmed, not the response body: the server may answer with an empty body.
      next: () => {
        this.confirmed.update((state) => withDone(state, id, done));
        this.settle(write);
      },
      error: () => {
        this.settle(write);
        onFail();
        this.errorState.set(`could not save todo ${id}`);
      },
    });
  }

  private settle(write: Pending): void {
    this.pending.update((writes) => writes.filter((w) => w !== write));
  }
}
