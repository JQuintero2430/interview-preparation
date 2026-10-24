import { type Observable, catchError } from 'rxjs';
import { rethrowAsUiError } from '../problem';

/** Variant a: a service wraps each request it makes, so only its callers see a `UiError`. */
export function mapToUiError<T>(request: Observable<T>): Observable<T> {
  return request.pipe(catchError(rethrowAsUiError));
}
