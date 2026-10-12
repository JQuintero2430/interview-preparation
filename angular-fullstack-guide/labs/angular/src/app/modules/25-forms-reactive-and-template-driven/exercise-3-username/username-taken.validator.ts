import { Injectable, inject } from '@angular/core';
import { AsyncValidator, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, map, switchMap, take, timer } from 'rxjs';
import { LabM25UserApi } from './user-api';

/**
 * Waits `debounceMs` (a new value unsubscribes the wait), asks the API once and completes.
 * Sync validators in front of it keep empty and short values away.
 */
export function usernameTaken(api: LabM25UserApi, debounceMs: number): AsyncValidatorFn {
  return (control): Observable<ValidationErrors | null> =>
    timer(debounceMs).pipe(
      switchMap(() => api.isTaken(String(control.value))),
      map((taken) => (taken ? { taken: true } : null)),
      take(1),
    );
}

/** The alternative: the same rule as an `AsyncValidator` class, ready to back a directive. */
@Injectable({ providedIn: 'root' })
export class LabM25UsernameTakenValidator implements AsyncValidator {
  readonly validate = usernameTaken(inject(LabM25UserApi), 300);
}
