// LEGACY: class-based HTTP interceptors, kept for the `#### Legacy` subsection of module 27 section 4.
// New code uses `HttpInterceptorFn` with `withInterceptors`. Later SEC tasks add exports below and keep these unchanged.
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpEvent,
  HttpHandler,
  HttpHandlerFn,
  HttpInterceptor,
  HttpInterceptorFn,
  HttpRequest,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { EnvironmentProviders, inject, Injectable, InjectionToken, Provider } from '@angular/core';
import { Observable } from 'rxjs';

/** Where the lab interceptors record that they ran. */
export const LAB_M27_LEGACY_LOG = new InjectionToken<string[]>('LAB_M27_LEGACY_LOG');

/** Legacy: a class interceptor. It runs only when `withInterceptorsFromDi()` is configured. Replacement: `labM27HeaderInterceptor`. */
@Injectable()
export class LabM27LegacyInterceptor implements HttpInterceptor {
  private readonly log = inject(LAB_M27_LEGACY_LOG);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    this.log.push('Legacy req');
    return next.handle(req.clone({ setHeaders: { 'X-Lab': 'legacy' } }));
  }
}

/** Legacy: the multi provider that registers the class under `HTTP_INTERCEPTORS`. */
export const labM27LegacyInterceptorProvider: Provider = {
  provide: HTTP_INTERCEPTORS,
  useClass: LabM27LegacyInterceptor,
  multi: true,
};

/** Legacy: the providers of an app that still has class interceptors. */
export const legacyHttpProviders: (Provider | EnvironmentProviders)[] = [
  provideHttpClient(withInterceptorsFromDi()),
  labM27LegacyInterceptorProvider,
];

/** Replacement for `LabM27LegacyInterceptor`: the same work as a function in an injection context. */
export const labM27HeaderInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  inject(LAB_M27_LEGACY_LOG).push('Header req');
  return next(req.clone({ setHeaders: { 'X-Lab': 'legacy' } }));
};

/** Legacy (section 9): `reportProgress` is deprecated since 22.0. On the fetch backend it reports download progress only. */
export function labM27LegacyUpload(http: HttpClient, file: Blob): Observable<HttpEvent<unknown>> {
  return http.post('/upload', file, { observe: 'events', reportProgress: true });
}

/** Replacement for `labM27LegacyUpload`: the split options. Upload progress needs `provideHttpClient(withXhr())`. */
export function labM27Upload(http: HttpClient, file: Blob): Observable<HttpEvent<unknown>> {
  return http.post('/upload', file, { observe: 'events', reportUploadProgress: true, reportDownloadProgress: true });
}
