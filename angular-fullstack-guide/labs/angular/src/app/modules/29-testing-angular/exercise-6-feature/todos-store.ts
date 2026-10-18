import { Injectable, inject, signal } from '@angular/core';
import type { Todo } from './todo';
import { TodosApi } from './todos-api';

export type TodosStatus = 'idle' | 'loading' | 'ready' | 'saving';

/** The feature's state: the list, what is in flight and the last error. */
@Injectable({ providedIn: 'root' })
export class TodosStore {
  private readonly api = inject(TodosApi);
  private readonly todosState = signal<readonly Todo[]>([]);
  private readonly statusState = signal<TodosStatus>('idle');
  private readonly errorState = signal<string | null>(null);

  readonly todos = this.todosState.asReadonly();
  readonly status = this.statusState.asReadonly();
  readonly error = this.errorState.asReadonly();

  load(): void {
    this.statusState.set('loading');
    this.errorState.set(null);
    this.api.list().subscribe({
      next: (todos) => {
        this.todosState.set(todos);
        this.statusState.set('ready');
      },
      error: () => this.fail('Could not load the todos'),
    });
  }

  /** Resolves `true` once the saved todo is in the list, `false` when the save failed. */
  add(title: string): Promise<boolean> {
    this.statusState.set('saving');
    this.errorState.set(null);
    return new Promise((resolve) => {
      this.api.create(title).subscribe({
        next: (todo) => {
          this.todosState.update((todos) => [...todos, todo]);
          this.statusState.set('ready');
          resolve(true);
        },
        error: () => {
          this.fail('Could not save the todo');
          resolve(false);
        },
      });
    });
  }

  private fail(message: string): void {
    this.errorState.set(message);
    this.statusState.set('ready');
  }
}
