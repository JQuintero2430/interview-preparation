import { Service, signal } from '@angular/core';

// Not provided in root: only a route's (or a legacy module's) `providers` create it.
@Service({ autoProvided: false })
export class AdminStore {
  readonly #users = signal<readonly string[]>(['ada', 'linus']);

  readonly users = this.#users.asReadonly();

  add(name: string): void {
    this.#users.update((users) => [...users, name]);
  }
}
