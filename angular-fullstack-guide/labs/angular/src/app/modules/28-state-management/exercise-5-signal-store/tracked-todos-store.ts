import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withHooks, withMethods } from '@ngrx/signals';
import { addEntity, setAllEntities, updateEntity, withEntities } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { switchMap, tap } from 'rxjs';
import { Todo } from './todo';
import { LabM28TodosApi } from './todos-api';
import { withTrackedRequest } from './with-tracked-request';

/** The alternative todos store: same members as `LabM28TodosStore`, the status driven by `withTrackedRequest()`. */
export const LabM28TrackedTodosStore = signalStore(
  { providedIn: 'root' },
  withEntities<Todo>(),
  withTrackedRequest(),
  withComputed(({ entities }) => ({
    remaining: computed(() => entities().filter((todo) => !todo.done).length),
    doneCount: computed(() => entities().filter((todo) => todo.done).length),
  })),
  withMethods((store, api = inject(LabM28TodosApi)) => ({
    /** On error `_trackRequest` completes without emitting, so `tap` never runs and the entities stay. */
    load: rxMethod<void>(
      switchMap(() => store._trackRequest(api.getTodos()).pipe(tap((todos) => patchState(store, setAllEntities(todos))))),
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
