import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withMethods } from '@ngrx/signals';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { Author } from './todo';
import { LabM28TodosApi } from './todos-api';
import { setError, setFulfilled, setPending, withRequestStatus } from './with-request-status';

/** A second store: the same feature, no change to it. */
export const LabM28AuthorsStore = signalStore(
  { providedIn: 'root' },
  withEntities<Author>(),
  withRequestStatus(),
  withMethods((store, api = inject(LabM28TodosApi)) => ({
    load: rxMethod<void>(
      pipe(
        tap(() => patchState(store, setPending())),
        switchMap(() =>
          api.getAuthors().pipe(
            tapResponse({
              next: (authors) => patchState(store, setAllEntities(authors), setFulfilled()),
              error: (error: HttpErrorResponse) => patchState(store, setError(error.message)),
            }),
          ),
        ),
      ),
    ),
  })),
);
