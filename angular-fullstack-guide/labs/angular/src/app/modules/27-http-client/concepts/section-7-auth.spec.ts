import {
  HttpClient,
  HttpContext,
  HttpContextToken,
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpRequest,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Injectable, inject, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, catchError, finalize, map, shareReplay, switchMap, tap, throwError } from 'rxjs';

const API_ORIGIN = 'https://api.example.test';
const SKIP_AUTH = new HttpContextToken<boolean>(() => false);

/** Relative URLs resolve against the API origin, so they count as API requests. */
function isApiUrl(url: string): boolean {
  return new URL(url, API_ORIGIN).origin === API_ORIGIN;
}

function withBearer(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

function refreshRequest(http: HttpClient): Observable<{ token: string }> {
  return http.post<{ token: string }>('/auth/refresh', null, {
    context: new HttpContext().set(SKIP_AUTH, true),
  });
}

@Injectable({ providedIn: 'root' })
class LabM27Auth {
  private readonly http = inject(HttpClient);
  readonly token = signal('old');
  readonly logouts = signal(0);
  private inFlight: Observable<string> | null = null;

  /** Single flight: concurrent callers share the one refresh until it ends. */
  refresh(): Observable<string> {
    this.inFlight ??= refreshRequest(this.http).pipe(
      map((response) => response.token),
      tap((token) => this.token.set(token)),
      catchError((error: unknown) => {
        this.logouts.update((count) => count + 1);
        this.token.set('');
        return throwError(() => error);
      }),
      finalize(() => (this.inFlight = null)),
      shareReplay(1),
    );
    return this.inFlight;
  }
}

/** Bearer on API requests only; on a 401, wait for the shared refresh and retry once. */
const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(LabM27Auth);
  if (req.context.get(SKIP_AUTH) || !isApiUrl(req.url)) return next(req);
  return next(withBearer(req, auth.token())).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401) return throwError(() => error);
      return auth.refresh().pipe(switchMap((token) => next(withBearer(req, token))));
    }),
  );
};

/** Bug 1: no skip check, so the refresh request is refreshed when it fails. */
const refreshesItself: HttpInterceptorFn = (req, next) => {
  const http = inject(HttpClient);
  return next(req).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401) return throwError(() => error);
      return http.post<{ token: string }>('/auth/refresh', null).pipe(switchMap(() => next(req)));
    }),
  );
};

/** Bug 2: the skip check is there, but every 401 starts its own refresh. */
const refreshPerRequest: HttpInterceptorFn = (req, next) => {
  const http = inject(HttpClient);
  if (req.context.get(SKIP_AUTH)) return next(req);
  return next(req).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401) return throwError(() => error);
      return refreshRequest(http).pipe(switchMap(() => next(req)));
    }),
  );
};

describe('Section 7: authentication', () => {
  let controller: HttpTestingController;
  let http: HttpClient;
  let auth: LabM27Auth;
  const chain: string[] = [];

  const recorder: HttpInterceptorFn = (req, next) => {
    chain.push(`${req.url} skip=${req.context.get(SKIP_AUTH)}`);
    return next(req);
  };

  function setup(...interceptors: HttpInterceptorFn[]): void {
    chain.length = 0;
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors(interceptors)), provideHttpClientTesting()],
    });
    controller = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
    auth = TestBed.inject(LabM27Auth);
  }

  function unauthorized(url: string): void {
    controller.expectOne(url).flush(null, { status: 401, statusText: 'Unauthorized' });
  }

  it('Section 7: the auth interceptor adds the bearer token to API requests only', () => {
    setup(authInterceptor);
    http.get('/a').subscribe();
    http.get('https://api.example.test/b').subscribe();
    http.get('https://analytics.example.test/collect').subscribe();
    http.get('https://api.example.test.evil.test/c').subscribe();
    expect(controller.expectOne('/a').request.headers.get('Authorization')).toBe('Bearer old');
    expect(controller.expectOne('https://api.example.test/b').request.headers.get('Authorization')).toBe('Bearer old');
    expect(controller.expectOne('https://analytics.example.test/collect').request.headers.has('Authorization')).toBe(
      false,
    );
    expect(controller.expectOne('https://api.example.test.evil.test/c').request.headers.has('Authorization')).toBe(
      false,
    );
  });

  it('Section 7: two concurrent 401s trigger one refresh', () => {
    setup(authInterceptor);
    http.get('/a').subscribe();
    http.get('/b').subscribe();
    const first = controller.expectOne('/a');
    expect(first.request.headers.get('Authorization')).toBe('Bearer old');
    first.flush(null, { status: 401, statusText: 'Unauthorized' });
    unauthorized('/b');
    const refreshes = controller.match('/auth/refresh');
    expect(refreshes).toHaveLength(1);
    refreshes[0].flush({ token: 'new' });
    expect(auth.token()).toBe('new');
    controller.match('/a').forEach((req) => req.flush({ ok: '/a' }));
    controller.match('/b').forEach((req) => req.flush({ ok: '/b' }));
    controller.verify();
  });

  it('Section 7: queued requests retry once with the new token', () => {
    setup(authInterceptor);
    const bodies: unknown[] = [];
    http.get('/a').subscribe((body) => bodies.push(body));
    http.get('/b').subscribe((body) => bodies.push(body));
    unauthorized('/a');
    unauthorized('/b');
    controller.expectOne('/auth/refresh').flush({ token: 'new' });
    const retryA = controller.expectOne('/a');
    const retryB = controller.expectOne('/b');
    expect(retryA.request.headers.get('Authorization')).toBe('Bearer new');
    expect(retryB.request.headers.get('Authorization')).toBe('Bearer new');
    retryA.flush({ ok: '/a' });
    retryB.flush({ ok: '/b' });
    expect(bodies).toEqual([{ ok: '/a' }, { ok: '/b' }]);
    controller.verify();
  });

  it('Section 7: the refresh request carries no bearer token', () => {
    setup(recorder, authInterceptor);
    http.get('/a').subscribe();
    unauthorized('/a');
    const refresh = controller.expectOne('/auth/refresh');
    expect(refresh.request.headers.has('Authorization')).toBe(false);
    expect(refresh.request.context.get(SKIP_AUTH)).toBe(true);
    expect(chain).toContain('/auth/refresh skip=true');
    refresh.flush({ token: 'new' });
    controller.expectOne('/a').flush({ ok: true });
    controller.verify();
  });

  it('Section 7: a failed refresh ends the session without a loop', () => {
    setup(authInterceptor);
    const errors: HttpErrorResponse[] = [];
    http.get('/a').subscribe({ error: (error: HttpErrorResponse) => errors.push(error) });
    http.get('/b').subscribe({ error: (error: HttpErrorResponse) => errors.push(error) });
    unauthorized('/a');
    unauthorized('/b');
    controller.expectOne('/auth/refresh').flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(errors).toHaveLength(2);
    expect(errors.map((error) => error.status)).toEqual([401, 401]);
    expect(errors[0].url).toBe('/auth/refresh');
    expect(auth.logouts()).toBe(1);
    expect(auth.token()).toBe('');
    controller.verify();
  });

  it('Section 7: a 401 after the retry fails the request instead of refreshing again', () => {
    setup(authInterceptor);
    let failure: HttpErrorResponse | undefined;
    http.get('/a').subscribe({ error: (error: HttpErrorResponse) => (failure = error) });
    unauthorized('/a');
    controller.expectOne('/auth/refresh').flush({ token: 'new' });
    unauthorized('/a');
    expect(failure?.status).toBe(401);
    expect(failure?.url).toBe('/a');
    controller.expectNone('/auth/refresh');
    controller.verify();
  });

  it('Section 7: without the skip check a failing refresh refreshes itself until a guard stops the spec', () => {
    setup(refreshesItself);
    http.get('/a').subscribe({ error: () => undefined });
    unauthorized('/a');
    const guard = 5;
    let refreshes = 0;
    for (let round = 0; round < guard; round++) {
      const pending = controller.match('/auth/refresh');
      refreshes += pending.length;
      pending.forEach((req) => req.flush(null, { status: 401, statusText: 'Unauthorized' }));
    }
    expect(refreshes).toBe(guard);
    expect(controller.match('/auth/refresh')).toHaveLength(1);
  });

  it('Section 7: without single flight each concurrent 401 starts its own refresh', () => {
    setup(refreshPerRequest);
    for (const url of ['/a', '/b', '/c']) http.get(url).subscribe({ error: () => undefined });
    for (const url of ['/a', '/b', '/c']) unauthorized(url);
    const refreshes = controller.match('/auth/refresh');
    expect(refreshes).toHaveLength(3);
    refreshes.forEach((req) => req.flush(null, { status: 401, statusText: 'Unauthorized' }));
    controller.verify();
  });
});
