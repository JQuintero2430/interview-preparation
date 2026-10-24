// Exercise 44.2, variant a: a functional interceptor adds `traceparent` and turns failures into reports.
import { type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs';
import { ErrorReporter, Tracer } from '../tracing';

/** The caller still gets every error; the reporter only queues a copy with the trace ID. */
export const traceRequests: HttpInterceptorFn = (req, next) => {
  const trace = inject(Tracer).traceRequest(req.urlWithParams);
  const reporter = inject(ErrorReporter);
  const traced = trace.traceparent === null ? req : req.clone({ setHeaders: { traceparent: trace.traceparent } });
  return next(traced).pipe(tap({ error: (error: unknown) => reporter.report(error, trace.traceId) }));
};
