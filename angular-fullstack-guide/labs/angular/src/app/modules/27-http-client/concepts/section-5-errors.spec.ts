import {
  HttpClient,
  HttpContext,
  HttpContextToken,
  HttpErrorResponse,
  HttpInterceptorFn,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, retry, throwError, timer } from 'rxjs';

type LabM27Failure =
  | { kind: 'offline' }
  | { kind: 'timeout' }
  | { kind: 'not-found' }
  | { kind: 'validation'; fields: Record<string, string> }
  | { kind: 'auth' }
  | { kind: 'server'; status: number }
  | { kind: 'invalid-response' }
  | { kind: 'unknown' };

const STATUS_KINDS = new Map<number, 'not-found' | 'auth'>([
  [401, 'auth'],
  [403, 'auth'],
  [404, 'not-found'],
]);

function validationFields(body: unknown): Record<string, string> {
  return typeof body === 'object' && body !== null && 'fields' in body && typeof body.fields === 'object'
    ? Object.fromEntries(Object.entries(body.fields ?? {}).map(([name, text]) => [name, String(text)]))
    : {};
}

function networkFailure(error: unknown): LabM27Failure {
  return error instanceof DOMException && error.name === 'TimeoutError' ? { kind: 'timeout' } : { kind: 'offline' };
}

function toLabM27Failure(err: HttpErrorResponse): LabM27Failure {
  if (err.status === 0) return networkFailure(err.error);
  if (err.status >= 200 && err.status < 300) return { kind: 'invalid-response' };
  if (err.status === 400 || err.status === 422) return { kind: 'validation', fields: validationFields(err.error) };
  if (err.status >= 500) return { kind: 'server', status: err.status };
  const kind = STATUS_KINDS.get(err.status);
  return kind ? { kind } : { kind: 'unknown' };
}

const LAB_M27_NO_RETRY = new HttpContextToken<boolean>(() => false);
const IDEMPOTENT = new Set(['GET', 'HEAD', 'OPTIONS', 'PUT', 'DELETE']);

function backoffMs(attempt: number, random: number): number {
  return Math.min(2000, Math.round(100 * 2 ** (attempt - 1) * (0.5 + random)));
}

function isRetryable(err: unknown): boolean {
  return err instanceof HttpErrorResponse && (err.status === 0 || err.status === 429 || err.status >= 500);
}

function labM27Retry(random: () => number, delays: number[]): HttpInterceptorFn {
  return (req, next) => {
    if (!IDEMPOTENT.has(req.method) || req.context.get(LAB_M27_NO_RETRY)) return next(req);
    return next(req).pipe(
      retry({
        count: 3,
        delay: (err: unknown, attempt: number) => {
          if (!isRetryable(err)) return throwError(() => err);
          const ms = backoffMs(attempt, random());
          delays.push(ms);
          return timer(ms);
        },
      }),
    );
  };
}

describe('Section 5: errors', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  function testing(...interceptors: HttpInterceptorFn[]): { http: HttpClient; controller: HttpTestingController } {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors(interceptors)), provideHttpClientTesting()],
    });
    return { http: TestBed.inject(HttpClient), controller: TestBed.inject(HttpTestingController) };
  }

  async function failureOf(request: Promise<unknown>): Promise<HttpErrorResponse> {
    const outcome = await request.then(
      () => null,
      (error: unknown) => error,
    );
    if (!(outcome instanceof HttpErrorResponse)) throw new Error('expected an HttpErrorResponse');
    return outcome;
  }

  it('Section 5: a 404 carries status, body and message', () => {
    const { http, controller } = testing();
    let failure: HttpErrorResponse | undefined;
    http.get('/missing').subscribe({ error: (e: HttpErrorResponse) => (failure = e) });
    controller.expectOne('/missing').flush({ code: 'NF' }, { status: 404, statusText: 'Not Found' });
    expect(failure?.name).toBe('HttpErrorResponse');
    expect(failure?.status).toBe(404);
    expect(failure?.statusText).toBe('Not Found');
    expect(failure?.ok).toBe(false);
    expect(failure?.error).toEqual({ code: 'NF' });
    expect(failure?.url).toBe('/missing');
    expect(failure?.message).toBe('Http failure response for /missing: 404 Not Found');
  });

  it('Section 5: a network error has status 0 and a ProgressEvent', () => {
    const { http, controller } = testing();
    let failure: HttpErrorResponse | undefined;
    http.get('/net').subscribe({ error: (e: HttpErrorResponse) => (failure = e) });
    controller.expectOne('/net').error(new ProgressEvent('error'));
    expect(failure?.status).toBe(0);
    expect(failure?.statusText).toBe('Unknown Error');
    expect(failure?.error).toBeInstanceOf(ProgressEvent);
    expect(failure?.message).toBe('Http failure response for /net: 0 ');
  });

  it('Section 5: a rejected fetch has status 0 and the thrown error', async () => {
    const thrown = new TypeError('Failed to fetch');
    vi.stubGlobal('fetch', () => Promise.reject(thrown));
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    const failure = await failureOf(firstValueFrom(TestBed.inject(HttpClient).get('/x')));
    expect(failure.status).toBe(0);
    expect(failure.error).toBe(thrown);
    expect(failure.message).toBe('Http failure response for /x: 0 undefined');
  });

  it('Section 5: a 500 with a JSON body keeps the parsed body in error', async () => {
    vi.stubGlobal(
      'fetch',
      async () =>
        new Response(JSON.stringify({ msg: 'boom' }), {
          status: 500,
          statusText: 'Internal Server Error',
          headers: { 'content-type': 'application/json' },
        }),
    );
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    const failure = await failureOf(firstValueFrom(TestBed.inject(HttpClient).get('/x')));
    expect(failure.status).toBe(500);
    expect(failure.error).toEqual({ msg: 'boom' });
    expect(failure.message).toBe('Http failure response for /x: 500 Internal Server Error');
  });

  it('Section 5: invalid JSON on a 200 is a parsing failure with status 200', async () => {
    vi.stubGlobal(
      'fetch',
      async () => new Response('not json', { status: 200, headers: { 'content-type': 'application/json' } }),
    );
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    const failure = await failureOf(firstValueFrom(TestBed.inject(HttpClient).get('/x')));
    expect(failure.status).toBe(200);
    expect(failure.ok).toBe(false);
    expect(failure.message).toBe('Http failure during parsing for /x');
  });

  it('Section 5: the XSSI prefix is stripped before parsing', async () => {
    vi.stubGlobal(
      'fetch',
      async () =>
        new Response(")]}',\n" + JSON.stringify({ a: 1 }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
    );
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    await expect(firstValueFrom(TestBed.inject(HttpClient).get('/x'))).resolves.toEqual({ a: 1 });
  });

  it('Section 5: a mapping function turns each failure into one domain error', () => {
    const timeout = new DOMException('signal timed out', 'TimeoutError');
    const cases: [HttpErrorResponse, LabM27Failure][] = [
      [new HttpErrorResponse({ status: 0, error: new ProgressEvent('error') }), { kind: 'offline' }],
      [new HttpErrorResponse({ status: 0, error: timeout }), { kind: 'timeout' }],
      [new HttpErrorResponse({ status: 404 }), { kind: 'not-found' }],
      [
        new HttpErrorResponse({ status: 422, error: { fields: { email: 'taken' } } }),
        { kind: 'validation', fields: { email: 'taken' } },
      ],
      [new HttpErrorResponse({ status: 401 }), { kind: 'auth' }],
      [new HttpErrorResponse({ status: 503 }), { kind: 'server', status: 503 }],
      [new HttpErrorResponse({ status: 200, error: { text: 'not json' } }), { kind: 'invalid-response' }],
      [new HttpErrorResponse({ status: 418 }), { kind: 'unknown' }],
    ];
    expect(cases.map(([err]) => toLabM27Failure(err))).toEqual(cases.map(([, expected]) => expected));
  });

  it('Section 5: the retry interceptor retries a 503 GET three times with growing delays', async () => {
    vi.useFakeTimers();
    try {
      const delays: number[] = [];
      const { http, controller } = testing(labM27Retry(() => 0.5, delays));
      let failure: HttpErrorResponse | undefined;
      http.get('/r').subscribe({ error: (e: HttpErrorResponse) => (failure = e) });
      let requests = 0;
      for (let attempt = 0; attempt < 4; attempt++) {
        controller.expectOne('/r').flush(null, { status: 503, statusText: 'Service Unavailable' });
        requests++;
        await vi.advanceTimersByTimeAsync(500);
      }
      controller.verify();
      expect(requests).toBe(4);
      expect(failure?.status).toBe(503);
      expect(delays).toEqual([100, 200, 400]);
      expect(backoffMs(10, 0.5)).toBe(2000);
      expect(backoffMs(1, 0)).toBe(50);
      expect(backoffMs(1, 1)).toBe(150);
    } finally {
      vi.useRealTimers();
    }
  });

  it('Section 5: the retry interceptor does not retry a 400, a POST or an opted-out request', async () => {
    vi.useFakeTimers();
    try {
      const delays: number[] = [];
      const { http, controller } = testing(labM27Retry(() => 0.5, delays));
      const errors: number[] = [];
      const record = { error: (e: HttpErrorResponse) => errors.push(e.status) };
      http.get('/bad').subscribe(record);
      http.post('/pay', {}).subscribe(record);
      http.get('/once', { context: new HttpContext().set(LAB_M27_NO_RETRY, true) }).subscribe(record);
      controller.expectOne('/bad').flush(null, { status: 400, statusText: 'Bad Request' });
      controller.expectOne('/pay').flush(null, { status: 503, statusText: 'Service Unavailable' });
      controller.expectOne('/once').flush(null, { status: 503, statusText: 'Service Unavailable' });
      await vi.advanceTimersByTimeAsync(1000);
      controller.verify();
      expect(errors).toEqual([400, 503, 503]);
      expect(delays).toEqual([]);
    } finally {
      vi.useRealTimers();
    }
  });
});
