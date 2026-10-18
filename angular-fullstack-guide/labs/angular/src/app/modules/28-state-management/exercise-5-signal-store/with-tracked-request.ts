import { HttpErrorResponse } from '@angular/common/http';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStoreFeature, withMethods } from '@ngrx/signals';
import { Observable, defer } from 'rxjs';
import { setError, setFulfilled, setPending, withRequestStatus } from './with-request-status';

/**
 * The alternative: the feature reuses `withRequestStatus()` and also owns the transitions, so a store
 * wraps its request in `_trackRequest` instead of calling the three updaters itself.
 */
export function withTrackedRequest() {
  return signalStoreFeature(
    withRequestStatus(),
    withMethods((store) => ({
      /**
       * Sets `pending` on subscription, then `fulfilled` or `error`; the `_` prefix keeps it out of the public store.
       * `tapResponse` swallows the error here, so the caller's `switchMap` survives it and its later steps never run.
       */
      _trackRequest<T>(request: Observable<T>): Observable<T> {
        // `defer` rather than a `tap` before `switchMap`: the status follows the subscription the store actually makes.
        return defer(() => {
          patchState(store, setPending());
          return request.pipe(
            tapResponse({
              next: () => patchState(store, setFulfilled()),
              error: (error: HttpErrorResponse) => patchState(store, setError(error.message)),
            }),
          );
        });
      },
    })),
  );
}
