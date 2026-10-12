import { computed, Service, signal } from '@angular/core';

export interface Task {
  readonly id: number;
  readonly title: string;
  readonly done: boolean;
}

// One class for both worlds: the legacy module lists it in `providers`, the solution in a route's.
@Service({ autoProvided: false })
export class TaskStore {
  readonly #tasks = signal<readonly Task[]>([
    { id: 1, title: 'Write the specs', done: true },
    { id: 2, title: 'Delete TasksModule', done: false },
  ]);

  readonly tasks = this.#tasks.asReadonly();
  readonly open = computed(() => this.#tasks().filter((task) => !task.done).length);

  toggle(id: number): void {
    this.#tasks.update((tasks) => tasks.map((task) => (task.id === id ? { ...task, done: !task.done } : task)));
  }
}
