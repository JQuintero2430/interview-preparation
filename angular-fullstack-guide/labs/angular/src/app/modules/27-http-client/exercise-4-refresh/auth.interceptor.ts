import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { InjectionToken, inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthStore, SKIP_AUTH } from './auth-store';

export { SKIP_AUTH };

/** The origin whose requests carry the token; a relative URL counts as on it. */
export const API_ORIGIN = new InjectionToken<string>('API_ORIGIN', {
  providedIn: 'root',
  factory: () => 'https://api.example.test',
});

function withBearer(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

/** Adds the bearer token to API requests; on a 401, waits for the shared refresh and retries once. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthStore);
  const origin = inject(API_ORIGIN);
  if (req.context.get(SKIP_AUTH) || new URL(req.url, origin).origin !== new URL(origin).origin) return next(req);

  return next(withBearer(req, auth.accessToken())).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401) return throwError(() => error);
      // The retry is outside this catchError, so a second 401 reaches the caller instead of refreshing again.
      return auth.refresh().pipe(switchMap((token) => next(withBearer(req, token))));
    }),
  );
};
