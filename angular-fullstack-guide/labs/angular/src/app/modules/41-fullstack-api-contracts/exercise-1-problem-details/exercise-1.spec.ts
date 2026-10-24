import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { type Observable, firstValueFrom } from 'rxjs';
import { mapToUiError } from './a/problem-mapper';
import { problemInterceptor } from './b/problem.interceptor';
import { PROBLEM_TYPES, type UiError } from './problem';

type Variant = 'a' | 'b';
const VARIANTS: readonly Variant[] = ['a', 'b'];

/** Our Spring-shaped 400 for an invalid order: `ProblemDetail` members plus our `type` and `errors`. */
const VALIDATION_PROBLEM = {
  type: 'https://api.example.com/problems/validation',
  title: 'Bad Request',
  status: 400,
  detail: 'Invalid request content.',
  instance: '/api/orders',
  errors: [{ pointer: '#/quantity', detail: 'Order at least one item' }],
};

const VALIDATION_UI_ERROR: UiError = {
  kind: 'validation',
  status: 400,
  fields: [{ pointer: '#/quantity', detail: 'Order at least one item' }],
};

/** A fake `fetch` that answers every call with `body` under the given status and content type. */
function answerWith(status: number, body: string, contentType: string) {
  return vi.fn<typeof fetch>(async () => new Response(body, { status, headers: { 'content-type': contentType } }));
}

function answerWithProblem(status: number, problem: object) {
  return answerWith(status, JSON.stringify(problem), 'application/problem+json');
}

/** A fresh client per call, with the variant's wiring: a wraps the request, b registers the interceptor. */
function setUp(variant: Variant, stub: ReturnType<typeof answerWith>): HttpClient {
  TestBed.resetTestingModule();
  vi.stubGlobal('fetch', stub);
  const features = variant === 'b' ? [withInterceptors([problemInterceptor])] : [];
  TestBed.configureTestingModule({ providers: [provideHttpClient(...features)] });
  return TestBed.inject(HttpClient);
}

/** The same two requests for both variants: a JSON read and a blob download. */
function send(variant: Variant, http: HttpClient, body: 'json' | 'blob'): Observable<unknown> {
  const request: Observable<unknown> =
    body === 'json' ? http.get('/api/orders/7') : http.get('/api/orders/7/invoice', { responseType: 'blob' });
  return variant === 'a' ? mapToUiError(request) : request;
}

async function failure(request: Observable<unknown>): Promise<unknown> {
  return firstValueFrom(request).then(
    () => 'completed',
    (err: unknown) => err,
  );
}

describe.each(VARIANTS)('Exercise 41.1 variant %s', (variant) => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reads a problem from a parsed JSON error body', async () => {
    const http = setUp(variant, answerWithProblem(400, VALIDATION_PROBLEM));
    expect(await failure(send(variant, http, 'json'))).toEqual(VALIDATION_UI_ERROR);
  });

  it('reads the same problem from the Blob error body of a download', async () => {
    const http = setUp(variant, answerWithProblem(400, VALIDATION_PROBLEM));
    expect(await failure(send(variant, http, 'blob'))).toEqual(VALIDATION_UI_ERROR);
  });

  it('maps a non-problem body (an HTML 502) to an unavailable error with its status', async () => {
    const http = setUp(variant, answerWith(502, '<html>Bad Gateway</html>', 'text/html'));
    expect(await failure(send(variant, http, 'json'))).toEqual({
      kind: 'unavailable',
      status: 502,
      detail: undefined,
    });
  });

  it('maps each catalogued problem type to its UI error kind', async () => {
    for (const [type, kind] of PROBLEM_TYPES) {
      // Status 400 is not in the status table, so only the type can produce the kind.
      const http = setUp(variant, answerWithProblem(400, { type, title: 'Problem', status: 400 }));
      expect(await failure(send(variant, http, 'json'))).toMatchObject({ kind, status: 400 });
    }
    expect(PROBLEM_TYPES.size).toBe(6);
  });

  it('falls back on the status when the problem has no type', async () => {
    const statusKinds: readonly [number, string][] = [
      [412, 'conflict'],
      [404, 'not-found'],
      [413, 'too-large'],
    ];
    for (const [status, kind] of statusKinds) {
      const http = setUp(variant, answerWithProblem(status, { title: 'No type', status }));
      expect(await failure(send(variant, http, 'json'))).toMatchObject({ kind, status });
    }
  });

  it('ignores unrecognized extension members without failing', async () => {
    const problem = {
      type: 'https://api.example.com/problems/order-conflict',
      title: 'Order changed',
      status: 409,
      detail: 'Order 7 changed',
      traceId: 'abc-123',
      retryAfterSeconds: 5,
    };
    const http = setUp(variant, answerWithProblem(409, problem));
    expect(await failure(send(variant, http, 'json'))).toEqual({
      kind: 'conflict',
      status: 409,
      detail: 'Order 7 changed',
    });
  });
});
