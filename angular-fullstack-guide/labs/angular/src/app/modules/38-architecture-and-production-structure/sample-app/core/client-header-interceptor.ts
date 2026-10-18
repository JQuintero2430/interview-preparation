import { HttpInterceptorFn } from '@angular/common/http';

/** App-wide interceptor: every request from every feature gets the same header. */
export const clientHeaderInterceptor: HttpInterceptorFn = (req, next) =>
  next(req.clone({ setHeaders: { 'X-Client': 'lab-m38-sample-app' } }));
