import { inject } from '@angular/core';
import { patchState, signalStore, withMethods } from '@ngrx/signals';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { switchMap, tap } from 'rxjs';
import { Author } from './todo';
import { LabM28TodosApi } from './todos-api';
import { withTrackedRequest } from './with-tracked-request';

/** The alternative's second store: the same feature, no change to it, and no updater imported. */
export const LabM28TrackedAuthorsStore = signalStore(
  { providedIn: 'root' },
  withEntities<Author>(),
  withTrackedRequest(),
  withMethods((store, api = inject(LabM28TodosApi)) => ({
    load: rxMethod<void>(
      switchMap(() =>
        store._trackRequest(api.getAuthors()).pipe(tap((authors) => patchState(store, setAllEntities(authors)))),
      ),
    ),
  })),
);
