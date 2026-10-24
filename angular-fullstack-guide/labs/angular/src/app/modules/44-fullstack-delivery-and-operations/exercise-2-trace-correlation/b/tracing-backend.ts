// Exercise 44.2, variant b: an HttpBackend decorator. It wraps the real backend and is provided in its place, so it
// sees each request after every interceptor. In @angular/common 22.2.1, provideHttpClient() registers HttpBackend as
// FetchBackend, and the last HttpBackend provider wins, so provideTracingBackend() must come after any other one.
import { FetchBackend, HttpBackend, type HttpEvent, type HttpRequest } from '@angular/common/http';
import { Injectable, InjectionToken, type Provider, inject } from '@angular/core';
import { type Observable, tap } from 'rxjs';
import { ErrorReporter, Tracer } from '../tracing';

/** The backend the decorator wraps: FetchBackend by default; a test points it at the testing backend. */
export const INNER_BACKEND = new InjectionToken<HttpBackend>('INNER_BACKEND', {
  providedIn: 'root',
  factory: () => inject(FetchBackend),
});

@Injectable()
export class TracingBackend implements HttpBackend {
  private readonly inner = inject(INNER_BACKEND);
  private readonly tracer = inject(Tracer);
  private readonly reporter = inject(ErrorReporter);

  handle(req: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
    const trace = this.tracer.traceRequest(req.urlWithParams);
    const traced = trace.traceparent === null ? req : req.clone({ setHeaders: { traceparent: trace.traceparent } });
    return this.inner.handle(traced).pipe(tap({ error: (error: unknown) => this.reporter.report(error, trace.traceId) }));
  }
}

export function provideTracingBackend(): Provider[] {
  return [TracingBackend, { provide: HttpBackend, useExisting: TracingBackend }];
}
