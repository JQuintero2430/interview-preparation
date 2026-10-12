import {
  HttpBackend,
  HttpClient,
  HttpClientModule,
  HttpContext,
  HttpContextToken,
  HttpErrorResponse,
  HttpEvent,
  HttpEventType,
  HttpInterceptorFn,
  HttpParams,
  HttpRequest,
  HttpResponse,
  httpResource,
  provideHttpClient,
  withFetch,
  withInterceptors,
  withRequestsMadeViaParent,
  withXhr,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PlatformLocation } from '@angular/common';
import {
  ApplicationRef,
  EnvironmentInjector,
  Injectable,
  createEnvironmentInjector,
  importProvidersFrom,
  inject,
  signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, catchError, finalize, firstValueFrom, map, retry, shareReplay, switchMap, tap, throwError, timer } from 'rxjs';

const lines: string[] = [];
const log = (value: unknown): void => {
  lines.push(String(value));
};

function logging(name: string): HttpInterceptorFn {
  return (req, next) => {
    log(name);
    return next(req);
  };
}

function testingSetup(): { http: HttpClient; controller: HttpTestingController } {
  TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
  return { http: TestBed.inject(HttpClient), controller: TestBed.inject(HttpTestingController) };
}

const SKIP_AUTH = new HttpContextToken<boolean>(() => false);

@Injectable({ providedIn: 'root' })
class Q27Auth {
  private readonly http = inject(HttpClient);
  readonly token = signal('old');
  refreshCalls = 0;
  private inFlight: Observable<string> | null = null;

  /** Single flight: every caller shares the one refresh until it ends. */
  refresh(): Observable<string> {
    this.refreshCalls++;
    this.inFlight ??= this.http
      .post<{ token: string }>('/auth/refresh', null, { context: new HttpContext().set(SKIP_AUTH, true) })
      .pipe(
        map((response) => response.token),
        tap((token) => this.token.set(token)),
        finalize(() => (this.inFlight = null)),
        shareReplay(1),
      );
    return this.inFlight;
  }
}

const withBearer = (req: HttpRequest<unknown>, token: string): HttpRequest<unknown> =>
  req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });

const refreshOn401: HttpInterceptorFn = (req, next) => {
  const auth = inject(Q27Auth);
  if (req.context.get(SKIP_AUTH)) return next(req);
  return next(withBearer(req, auth.token())).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401) return throwError(() => error);
      return auth.refresh().pipe(switchMap((token) => next(withBearer(req, token))));
    }),
  );
};

describe('Q27 outputs', () => {
  beforeEach(() => {
    lines.length = 0;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('Q27.03 no provider, provideHttpClient, withXhr, withFetch and HttpClientModule give these backends', () => {
    const configurations = [
      [],
      [provideHttpClient()],
      [provideHttpClient(withXhr())],
      [provideHttpClient(withFetch())],
      [importProvidersFrom(HttpClientModule)],
    ];
    for (const providers of configurations) {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ providers });
      log(TestBed.inject(HttpBackend).constructor.name);
    }
    expect(lines).toEqual(['FetchBackend', 'FetchBackend', 'HttpXhrBackend', 'FetchBackend', 'HttpXhrBackend']);
  });

  it('Q27.06 a child provideHttpClient with and without withRequestsMadeViaParent', async () => {
    const stub = vi.fn<typeof fetch>(
      async () => new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } }),
    );
    vi.stubGlobal('fetch', stub);
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([logging('parent')])), provideHttpClientTesting()],
    });
    const parent = TestBed.inject(EnvironmentInjector);
    const controller = TestBed.inject(HttpTestingController);
    const alone = createEnvironmentInjector([provideHttpClient(withInterceptors([logging('child')]))], parent);
    await new Promise((resolve) => alone.get(HttpClient).get('/alone').subscribe(resolve));
    log(`alone: controller ${controller.match('/alone').length}, fetch ${stub.mock.calls.length}`);
    const via = createEnvironmentInjector(
      [provideHttpClient(withInterceptors([logging('child')]), withRequestsMadeViaParent())],
      parent,
    );
    via.get(HttpClient).get('/via').subscribe();
    log(`via: controller ${controller.match('/via').length}, fetch ${stub.mock.calls.length}`);
    expect(lines).toEqual([
      'child',
      'alone: controller 0, fetch 1',
      'child',
      'parent',
      'via: controller 1, fetch 1',
    ]);
  });

  it('Q27.07 observe response, observe events and responseType text', () => {
    const { http, controller } = testingSetup();
    http
      .get<{ id: number }>('/r', { observe: 'response' })
      .subscribe((response) => log(`${response.status} ${response.headers.get('ETag')} ${JSON.stringify(response.body)}`));
    controller.expectOne('/r').flush({ id: 1 }, { headers: { ETag: 'v1' } });
    http.get('/e', { observe: 'events' }).subscribe((event) => log(HttpEventType[event.type]));
    controller.expectOne('/e').flush({ id: 1 });
    http.get('/t', { responseType: 'text' }).subscribe((text) => log(`${typeof text} ${text}`));
    controller.expectOne('/t').flush('hello');
    expect(lines).toEqual(['200 v1 {"id":1}', 'Sent', 'Response', 'string hello']);
  });

  it('Q27.08 HttpParams.set without reassignment, append, and a params object with an array', () => {
    const { http, controller } = testingSetup();
    const params = new HttpParams();
    params.set('q', 'lost');
    log(`'${params.toString()}'`);
    log(params.set('a', '1').append('a', '2').set('b', 'x y').toString());
    http.get('/s', { params: { q: 'a b', page: 2, tags: ['x', 'y'] } }).subscribe();
    const request = controller.expectOne((req) => req.url === '/s');
    log(request.request.urlWithParams);
    request.flush(null);
    expect(lines).toEqual(["''", 'a=1&a=2&b=x%20y', '/s?q=a%20b&page=2&tags=x&tags=y']);
  });

  it('Q27.11 two interceptors where A adds a header: request and response log order', () => {
    const seen = (name: string, req: HttpRequest<unknown>): void => {
      log(`${name} req headers=${req.headers.keys().join(',')}`);
    };
    const onResponse = (name: string) =>
      tap<HttpEvent<unknown>>((event) => {
        if (event instanceof HttpResponse) log(`${name} res`);
      });
    const a: HttpInterceptorFn = (req, next) => {
      seen('A', req);
      return next(req.clone({ setHeaders: { 'X-A': '1' } })).pipe(onResponse('A'));
    };
    const b: HttpInterceptorFn = (req, next) => {
      seen('B', req);
      return next(req).pipe(onResponse('B'));
    };
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([a, b])), provideHttpClientTesting()],
    });
    TestBed.inject(HttpClient).get('/v').subscribe();
    const request = TestBed.inject(HttpTestingController).expectOne('/v');
    log(`backend X-A=${request.request.headers.get('X-A')}`);
    request.flush('ok');
    expect(lines).toEqual(['A req headers=', 'B req headers=X-A', 'backend X-A=1', 'B res', 'A res']);
  });

  it('Q27.15 a 404 with JSON, a network failure and invalid JSON on a 200: status, error and message', async () => {
    const describeError = (e: HttpErrorResponse): void => {
      const error =
        e.error instanceof ProgressEvent ? 'ProgressEvent' : e.error instanceof Error ? e.error.name : JSON.stringify(e.error);
      log(`${e.status} | ${error} | ${e.message}`);
    };
    const { http, controller } = testingSetup();
    http.get('/missing').subscribe({ error: describeError });
    controller.expectOne('/missing').flush({ code: 'NF' }, { status: 404, statusText: 'Not Found' });
    http.get('/net').subscribe({ error: describeError });
    controller.expectOne('/net').error(new ProgressEvent('error'));
    vi.stubGlobal(
      'fetch',
      async () => new Response('not json', { status: 200, headers: { 'content-type': 'application/json' } }),
    );
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    await firstValueFrom(TestBed.inject(HttpClient).get('/x')).catch(describeError);
    expect(lines).toEqual([
      '404 | {"code":"NF"} | Http failure response for /missing: 404 Not Found',
      '0 | ProgressEvent | Http failure response for /net: 0 ',
      '200 | SyntaxError | Http failure during parsing for /x',
    ]);
  });

  it('Q27.17 a retry interceptor with backoff and jitter: requests per call', async () => {
    vi.useFakeTimers();
    try {
      const NO_RETRY = new HttpContextToken<boolean>(() => false);
      const IDEMPOTENT = new Set(['GET', 'HEAD', 'OPTIONS', 'PUT', 'DELETE']);
      const random = (): number => 0.5;
      const delays: number[] = [];
      const backoffMs = (attempt: number): number => Math.round(100 * 2 ** (attempt - 1) * (0.5 + random()));
      const isRetryable = (err: unknown): boolean =>
        err instanceof HttpErrorResponse && (err.status === 0 || err.status === 429 || err.status >= 500);
      const retrying: HttpInterceptorFn = (req, next) => {
        if (!IDEMPOTENT.has(req.method) || req.context.get(NO_RETRY)) return next(req);
        return next(req).pipe(
          retry({
            count: 3,
            delay: (err: unknown, attempt: number) => {
              if (!isRetryable(err)) return throwError(() => err);
              const ms = backoffMs(attempt);
              delays.push(ms);
              return timer(ms);
            },
          }),
        );
      };
      TestBed.configureTestingModule({
        providers: [provideHttpClient(withInterceptors([retrying])), provideHttpClientTesting()],
      });
      const http = TestBed.inject(HttpClient);
      const controller = TestBed.inject(HttpTestingController);
      const run = async (label: string, call: Observable<unknown>, url: string, status: number): Promise<void> => {
        let final = 0;
        let requests = 0;
        call.subscribe({ error: (e: HttpErrorResponse) => (final = e.status) });
        for (let open = controller.match(url); open.length > 0; open = controller.match(url)) {
          open[0].flush(null, { status, statusText: 'x' });
          requests++;
          await vi.advanceTimersByTimeAsync(1000);
        }
        log(`${label}: requests=${requests}, error=${final}`);
      };
      await run('GET 503', http.get('/a'), '/a', 503);
      await run('GET 400', http.get('/b'), '/b', 400);
      await run('POST 503', http.post('/c', {}), '/c', 503);
      await run('GET 503 NO_RETRY', http.get('/d', { context: new HttpContext().set(NO_RETRY, true) }), '/d', 503);
      log(`delays=${delays.join(',')}`);
      expect(lines).toEqual([
        'GET 503: requests=4, error=503',
        'GET 400: requests=1, error=400',
        'POST 503: requests=1, error=503',
        'GET 503 NO_RETRY: requests=1, error=503',
        'delays=100,200,400',
      ]);
    } finally {
      vi.useRealTimers();
    }
  });

  it('Q27.19 unsubscribing on the fetch backend and an expiring timeout', async () => {
    vi.useFakeTimers();
    try {
      const calls: RequestInit[] = [];
      vi.stubGlobal('fetch', (_input: RequestInfo | URL, init: RequestInit = {}) => {
        calls.push(init);
        return new Promise<Response>((_resolve, reject) => {
          init.signal?.addEventListener('abort', () => reject(init.signal?.reason));
        });
      });
      TestBed.configureTestingModule({ providers: [provideHttpClient()] });
      const http = TestBed.inject(HttpClient);
      const subscription = http.get('/slow').subscribe();
      log(`before: aborted=${calls[0].signal?.aborted}`);
      subscription.unsubscribe();
      log(`after: aborted=${calls[0].signal?.aborted}, reason=${(calls[0].signal?.reason as DOMException).name}`);
      http.get('/t', { timeout: 100 }).subscribe({
        error: (e: HttpErrorResponse) =>
          log(`timeout: status=${e.status}, error=${(e.error as DOMException).name}, message=${e.message}`),
      });
      await vi.advanceTimersByTimeAsync(150);
      log(`timeout signal: aborted=${calls[1].signal?.aborted}`);
      expect(lines).toEqual([
        'before: aborted=false',
        'after: aborted=true, reason=AbortError',
        'timeout: status=0, error=TimeoutError, message=Http failure response for /t: 0 undefined',
        'timeout signal: aborted=true',
      ]);
    } finally {
      vi.useRealTimers();
    }
  });

  it('Q27.23 two concurrent 401s behind a refresh interceptor: refresh requests and retry tokens', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([refreshOn401])), provideHttpClientTesting()],
    });
    const http = TestBed.inject(HttpClient);
    const controller = TestBed.inject(HttpTestingController);
    const auth = TestBed.inject(Q27Auth);
    const results: unknown[] = [];
    http.get('/a').subscribe((body) => results.push(body));
    http.get('/b').subscribe((body) => results.push(body));
    for (const url of ['/a', '/b']) {
      const req = controller.expectOne(url);
      log(`${url}: ${req.request.headers.get('Authorization')}`);
      req.flush(null, { status: 401, statusText: 'Unauthorized' });
    }
    const refreshes = controller.match('/auth/refresh');
    log(`refresh requests=${refreshes.length}, Authorization=${refreshes[0].request.headers.get('Authorization')}`);
    refreshes[0].flush({ token: 'new' });
    for (const url of ['/a', '/b']) {
      const retried = controller.expectOne(url);
      log(`${url} retry: ${retried.request.headers.get('Authorization')}`);
      retried.flush({ ok: url });
    }
    log(`results=${JSON.stringify(results)}, refresh() calls=${auth.refreshCalls}`);
    controller.verify();
    expect(lines).toEqual([
      '/a: Bearer old',
      '/b: Bearer old',
      'refresh requests=1, Authorization=null',
      '/a retry: Bearer new',
      '/b retry: Bearer new',
      'results=[{"ok":"/a"},{"ok":"/b"}], refresh() calls=2',
    ]);
  });

  it('Q27.25 seven requests with an XSRF-TOKEN cookie: which carry X-XSRF-TOKEN', () => {
    document.cookie = 'XSRF-TOKEN=abc';
    try {
      const { http, controller } = testingSetup();
      const origin = new URL(TestBed.inject(PlatformLocation).href).origin;
      http.post('/api/a', {}).subscribe();
      http.get('/api/b').subscribe();
      http.head('/api/h').subscribe();
      http.put('https://other.example/api/c', {}).subscribe();
      http.post(`${origin}/api/d`, {}).subscribe();
      http.delete('//other.example/api/e').subscribe();
      http.post('/api/f', {}, { headers: { 'X-XSRF-TOKEN': 'mine' } }).subscribe();
      const sent = ['/api/a', '/api/b', '/api/h', 'https://other.example/api/c'];
      sent.push(`${origin}/api/d`, '//other.example/api/e', '/api/f');
      for (const url of sent) {
        const req = controller.expectOne(url).request;
        log(`${req.method} ${req.url} -> ${req.headers.get('X-XSRF-TOKEN') ?? 'none'}`);
      }
      expect(lines).toEqual([
        'POST /api/a -> abc',
        'GET /api/b -> none',
        'HEAD /api/h -> none',
        'PUT https://other.example/api/c -> none',
        'POST http://_empty_/api/d -> abc',
        'DELETE //other.example/api/e -> none',
        'POST /api/f -> mine',
      ]);
    } finally {
      document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  });

  it('Q27.28 reportUploadProgress on the fetch backend and on a testing backend with withXhr', async () => {
    const stub = vi.fn<typeof fetch>(async () => new Response('{}'));
    vi.stubGlobal('fetch', stub);
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    const upload = { reportUploadProgress: true, observe: 'events' } as const;
    await firstValueFrom(TestBed.inject(HttpClient).post('/up', new Blob(['x']), upload)).catch(
      (e: HttpErrorResponse) => log(`fetch backend: status=${e.status}, error=${(e.error as Error).message.split(' Please')[0]}, fetch calls=${stub.mock.calls.length}`),
    );
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideHttpClient(withXhr()), provideHttpClientTesting()] });
    const events: string[] = [];
    TestBed.inject(HttpClient)
      .post('/up', new Blob(['x']), upload)
      .subscribe((event) =>
        events.push(
          event.type === HttpEventType.UploadProgress
            ? `UploadProgress ${event.loaded}/${event.total}`
            : HttpEventType[event.type],
        ),
      );
    const request = TestBed.inject(HttpTestingController).expectOne('/up');
    request.event({ type: HttpEventType.UploadProgress, loaded: 5, total: 10 });
    request.flush({ id: 1 });
    log(`testing backend: ${events.join(', ')}`);
    expect(lines).toEqual([
      'fetch backend: status=0, error=NG02824: The FetchBackend does not support upload progress reporting., fetch calls=0',
      'testing backend: Sent, UploadProgress 5/10, Response',
    ]);
  });

  it('Q27.30 an httpResource from undefined to /users/1 to /users/2, a 404 and a reload', async () => {
    const { controller } = testingSetup();
    const settle = (): Promise<void> => TestBed.inject(ApplicationRef).whenStable();
    const id = signal<number | undefined>(undefined);
    const user = TestBed.runInInjectionContext(() =>
      httpResource<{ id: number; name: string }>(() => (id() === undefined ? undefined : `/users/${id()}`)),
    );
    TestBed.tick();
    log(`undefined: ${user.status()}, requests=${controller.match(() => true).length}`);
    id.set(1);
    TestBed.tick();
    const first = controller.expectOne('/users/1');
    log(`/users/1: ${user.status()}, value=${user.value()}`);
    id.set(2);
    TestBed.tick();
    const second = controller.expectOne('/users/2');
    log(`/users/2: ${user.status()}, /users/1 cancelled=${first.cancelled}`);
    second.flush({ id: 2, name: 'Bo' });
    await settle();
    log(`flushed: ${user.status()}, value=${JSON.stringify(user.value())}, statusCode=${user.statusCode()}`);
    id.set(3);
    TestBed.tick();
    log(`/users/3: ${user.status()}, value=${user.value()}`);
    controller.expectOne('/users/3').flush('missing', { status: 404, statusText: 'Not Found' });
    await settle();
    log(`404: ${user.status()}, error status=${(user.error() as HttpErrorResponse).status}, hasValue=${user.hasValue()}`);
    user.reload();
    TestBed.tick();
    const retried = controller.match('/users/3');
    log(`reload(): ${user.status()}, requests=${retried.length}`);
    retried[0].flush({ id: 3, name: 'Cy' });
    await settle();
    log(`flushed: ${user.status()}, value=${JSON.stringify(user.value())}`);
    controller.verify();
    expect(lines).toEqual([
      'undefined: idle, requests=0',
      '/users/1: loading, value=undefined',
      '/users/2: loading, /users/1 cancelled=true',
      'flushed: resolved, value={"id":2,"name":"Bo"}, statusCode=200',
      '/users/3: loading, value=undefined',
      '404: error, error status=404, hasValue=false',
      'reload(): reloading, requests=1',
      'flushed: resolved, value={"id":3,"name":"Cy"}',
    ]);
  });
});
