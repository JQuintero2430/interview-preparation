import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withComputed, withHooks, withMethods } from '@ngrx/signals';
import { addEntity, setAllEntities, updateEntity, withEntities } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { Todo } from './todo';
import { LabM28TodosApi } from './todos-api';
import { setError, setFulfilled, setPending, withRequestStatus } from './with-request-status';

export const LabM28TodosStore = signalStore(
  { providedIn: 'root' },
  withEntities<Todo>(),
  withRequestStatus(),
  withComputed(({ entities }) => ({
    remaining: computed(() => entities().filter((todo) => !todo.done).length),
    doneCount: computed(() => entities().filter((todo) => todo.done).length),
  })),
  withMethods((store, api = inject(LabM28TodosApi)) => ({
    /** `switchMap` keeps the latest request; `tapResponse` handles the error inside, so the method survives it. */
    load: rxMethod<void>(
      pipe(
        tap(() => patchState(store, setPending())),
        switchMap(() =>
          api.getTodos().pipe(
            tapResponse({
              next: (todos) => patchState(store, setAllEntities(todos), setFulfilled()),
              error: (error: HttpErrorResponse) => patchState(store, setError(error.message)),
            }),
          ),
        ),
      ),
    ),
    add(title: string): void {
      const id = store.entities().reduce((max, todo) => Math.max(max, todo.id), 0) + 1;
      patchState(store, addEntity<Todo>({ id, title, done: false }));
    },
    toggle(id: number): void {
      patchState(store, updateEntity<Todo>({ id, changes: (todo) => ({ done: !todo.done }) }));
    },
  })),
  withHooks({ onInit: ({ load }) => load() }),
);
