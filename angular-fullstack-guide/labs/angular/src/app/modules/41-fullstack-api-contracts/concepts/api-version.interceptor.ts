import { HttpResponse, type HttpInterceptorFn } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { tap } from 'rxjs';

/** The version our example client asks for; Spring's `ApiVersionStrategy` reads it from the `X-Version` header. */
export const LAB_M41_API_VERSION = '1.2';

/** Our example's convention: API calls are relative `/api/` URLs, so the dev proxy serves them. */
const API_PREFIX = '/api/';

export interface LabM41Deprecation {
  readonly endpoint: string;
  readonly deprecation: string;
}

/** Keeps one entry per endpoint whose responses carried a `Deprecation` header. */
@Injectable({ providedIn: 'root' })
export class LabM41DeprecationLog {
  private readonly reported = signal<readonly LabM41Deprecation[]>([]);
  readonly entries = this.reported.asReadonly();

  report(entry: LabM41Deprecation): void {
    if (this.reported().some((known) => known.endpoint === entry.endpoint)) return;
    this.reported.update((known) => [...known, entry]);
  }
}

/** Adds `X-Version` to API requests only and reports a `Deprecation` response header once per endpoint. */
export const apiVersionInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(API_PREFIX)) return next(req);
  const log = inject(LabM41DeprecationLog);
  return next(req.clone({ setHeaders: { 'X-Version': LAB_M41_API_VERSION } })).pipe(
    tap((event) => {
      const deprecation = event instanceof HttpResponse ? event.headers.get('Deprecation') : null;
      if (deprecation !== null) log.report({ endpoint: `${req.method} ${req.url}`, deprecation });
    }),
  );
};
