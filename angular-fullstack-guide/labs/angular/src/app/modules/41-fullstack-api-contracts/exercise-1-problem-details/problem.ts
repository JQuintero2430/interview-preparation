import { HttpErrorResponse } from '@angular/common/http';
import { type Observable, from, switchMap, throwError } from 'rxjs';
import { type FieldProblem, readProblem } from '../concepts/problem-details';

export type PlainKind = 'conflict' | 'not-found' | 'too-large' | 'forbidden' | 'unavailable' | 'unknown';

/** What the UI shows: one kind per failure, with the HTTP status that produced it. */
export type UiError =
  | { readonly kind: 'validation'; readonly status: number; readonly fields: readonly FieldProblem[] }
  | { readonly kind: PlainKind; readonly status: number; readonly detail: string | undefined };

/** Our problem-type catalogue: the type URIs our Spring advice renders (ours, not a standard). */
export const PROBLEM_TYPES: ReadonlyMap<string, UiError['kind']> = new Map([
  ['https://api.example.com/problems/validation', 'validation'],
  ['https://api.example.com/problems/order-conflict', 'conflict'],
  ['https://api.example.com/problems/order-not-found', 'not-found'],
  ['https://api.example.com/problems/upload-too-large', 'too-large'],
  ['https://api.example.com/problems/forbidden', 'forbidden'],
  ['https://api.example.com/problems/maintenance', 'unavailable'],
]);

/** The fallback when the type is `about:blank` or not catalogued: the response status decides. */
const STATUS_KINDS: ReadonlyMap<number, UiError['kind']> = new Map([
  [403, 'forbidden'],
  [404, 'not-found'],
  [409, 'conflict'],
  [412, 'conflict'],
  [413, 'too-large'],
  [502, 'unavailable'],
  [503, 'unavailable'],
  [504, 'unavailable'],
]);

/** Reads the error body (object, text or `Blob`) and returns one `UiError`; extension members are dropped. */
export async function toUiError(err: HttpErrorResponse): Promise<UiError> {
  const problem = await readProblem(err.error);
  const kind = (problem && PROBLEM_TYPES.get(problem.type)) ?? STATUS_KINDS.get(err.status) ?? 'unknown';
  if (kind === 'validation') return { kind, status: err.status, fields: problem?.errors ?? [] };
  return { kind, status: err.status, detail: problem?.detail };
}

/** For `catchError`: rethrows an `HttpErrorResponse` as a `UiError`, and anything else unchanged. */
export function rethrowAsUiError(err: unknown): Observable<never> {
  if (!(err instanceof HttpErrorResponse)) return throwError(() => err);
  return from(toUiError(err)).pipe(switchMap((uiError) => throwError(() => uiError)));
}
