import type { HttpInterceptorFn } from '@angular/common/http';
import { catchError } from 'rxjs';
import { rethrowAsUiError } from '../problem';

/** Variant b: one interceptor normalizes every failure once, so no call site parses a body. */
export const problemInterceptor: HttpInterceptorFn = (req, next) => next(req).pipe(catchError(rethrowAsUiError));
