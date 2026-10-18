import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, EMPTY, combineLatest, map, switchMap, catchError, tap } from 'rxjs';
import { Todo } from './todo';
import { LabM30TodosApi } from './todos-api';

type LoadStatus = 'loading' | 'error' | 'ready';

/** The fixture page every module-30 end-to-end test drives. Texts, roles and labels are part of its contract. */
@Component({
  selector: 'lab-m30-todos-page',
  template: `
    <section aria-labelledby="lab-m30-heading">
      <h2 id="lab-m30-heading">Todos</h2>

      <form (submit)="$event.preventDefault(); add(titleInput)">
        <label for="lab-m30-title">New todo</label>
        <input id="lab-m30-title" #titleInput [attr.aria-invalid]="titleError()" />
        <button type="submit">Add</button>
        @if (titleError()) {
          <p role="alert">Title is required</p>
        }
        @if (saved()) {
          <p role="status">Saved</p>
        }
      </form>

      @switch (status()) {
        @case ('loading') {
          <p role="status">Loading…</p>
        }
        @case ('error') {
          <p role="alert">Could not load todos</p>
          <button type="button" (click)="retry()">Retry</button>
        }
        @case ('ready') {
          @if (todos().length === 0) {
            <p>No todos yet</p>
          } @else {
            <ul role="list">
              @for (todo of todos(); track todo.id) {
                <li>
                  <label>
                    <input type="checkbox" [checked]="todo.done" (change)="toggle(todo.id)" />
                    {{ todo.title }}
                  </label>
                  <button type="button" (click)="remove(todo.id)">Delete</button>
                </li>
              }
            </ul>
          }
        }
      }
    </section>
  `,
})
export class LabM30TodosPage {
  private readonly api = inject(LabM30TodosApi);
  private readonly reload = new BehaviorSubject<void>(undefined);

  readonly query = toSignal(inject(ActivatedRoute).queryParamMap.pipe(map((params) => params.get('q') ?? '')), {
    initialValue: '',
  });
  readonly status = signal<LoadStatus>('loading');
  readonly todos = signal<Todo[]>([]);
  readonly titleError = signal(false);
  readonly saved = signal(false);

  constructor() {
    combineLatest([toObservable(this.query), this.reload])
      .pipe(
        switchMap(([q]) => this.load(q)),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  retry(): void {
    this.reload.next();
  }

  add(input: HTMLInputElement): void {
    const title = input.value.trim();
    this.saved.set(false);
    this.titleError.set(title === '');
    if (title === '') {
      return;
    }
    this.api.create(title).subscribe((todo) => {
      this.todos.update((todos) => [...todos, todo]);
      this.saved.set(true);
      input.value = '';
    });
  }

  remove(id: number): void {
    this.api.remove(id).subscribe(() => this.todos.update((todos) => todos.filter((todo) => todo.id !== id)));
  }

  toggle(id: number): void {
    this.todos.update((todos) => todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)));
  }

  private load(q: string) {
    this.status.set('loading');
    return this.api.list(q).pipe(
      tap((todos) => {
        this.todos.set(todos);
        this.status.set('ready');
      }),
      catchError(() => {
        this.status.set('error');
        return EMPTY;
      }),
    );
  }
}
