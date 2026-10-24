import { HttpClient, HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { type Observable, firstValueFrom } from 'rxjs';
import { problemKey, readProblem } from './problem-details';

/** Our Spring-shaped validation body: `ProblemDetail` members plus the `type` and `errors` our advice adds. */
const VALIDATION_PROBLEM = {
  type: 'https://api.example.com/problems/validation',
  title: 'Bad Request',
  status: 400,
  detail: 'Invalid request content.',
  instance: '/api/orders',
  errors: [{ pointer: '#/quantity', detail: 'Order at least one item' }],
};

/** Our Spring-shaped 412 body: what `ProblemDetail.forStatus(412)` renders, with no `type`. */
const STALE_WRITE_PROBLEM = { title: 'Precondition Failed', status: 412, instance: '/api/orders/7' };

/** Our example mapping from problem keys to UI kinds; the mapping layer itself is module 27's. */
const UI_KINDS = new Map([
  ['https://api.example.com/problems/validation', 'validation'],
  ['412', 'conflict'],
]);

/** A fake `fetch` that answers every call with `body` as JSON under the given status and content type. */
function answerWith(status: number, body: unknown, contentType = 'application/problem+json') {
  return vi.fn<typeof fetch>(
    async () => new Response(JSON.stringify(body), { status, headers: { 'content-type': contentType } }),
  );
}

function setUp(stub: ReturnType<typeof answerWith>): HttpClient {
  vi.stubGlobal('fetch', stub);
  TestBed.configureTestingModule({ providers: [provideHttpClient()] });
  return TestBed.inject(HttpClient);
}

async function failure(request: Observable<unknown>): Promise<HttpErrorResponse> {
  const outcome: unknown = await firstValueFrom(request).then(
    () => 'completed',
    (err: unknown) => err,
  );
  if (outcome instanceof HttpErrorResponse) return outcome;
  throw new Error(`expected an HttpErrorResponse, got ${String(outcome)}`);
}

describe('Section 5: error contracts with problem details', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('Section 5: a problem body arrives parsed on a JSON request', async () => {
    const http = setUp(answerWith(400, VALIDATION_PROBLEM));
    const err = await failure(http.post('/api/orders', { quantity: 0 }));
    expect(err.status).toBe(400);
    expect(err.error).toEqual(VALIDATION_PROBLEM);
  });

  it('Section 5: the same problem arrives as a Blob on a blob request', async () => {
    const http = setUp(answerWith(400, VALIDATION_PROBLEM));
    const err = await failure(http.get('/api/orders/7/invoice', { responseType: 'blob' }));
    expect(err.error).toBeInstanceOf(Blob);
    expect(err.error.type).toBe('application/problem+json');
  });

  it('Section 5: readProblem returns the same problem from the object and from the Blob', async () => {
    const http = setUp(answerWith(400, VALIDATION_PROBLEM));
    const fromJson = await failure(http.post('/api/orders', { quantity: 0 }));
    const fromBlob = await failure(http.get('/api/orders/7/invoice', { responseType: 'blob' }));
    expect(await readProblem(fromJson.error)).toEqual(VALIDATION_PROBLEM);
    expect(await readProblem(fromBlob.error)).toEqual(VALIDATION_PROBLEM);
  });

  it('Section 5: a body without status or title is not read as a problem', async () => {
    const http = setUp(answerWith(404, { message: 'Order not found' }, 'application/json'));
    const err = await failure(http.get('/api/orders/404'));
    expect(err.error).toEqual({ message: 'Order not found' });
    expect(await readProblem(err.error)).toBeNull();
  });

  it('Section 5: a 412 from a stale If-Match maps to a conflict problem', async () => {
    const stub = answerWith(412, STALE_WRITE_PROBLEM);
    const http = setUp(stub);
    const err = await failure(http.put('/api/orders/7', { quantity: 2 }, { headers: { 'If-Match': '"3"' } }));
    expect(new Headers(stub.mock.calls[0][1]?.headers).get('If-Match')).toBe('"3"');
    const problem = await readProblem(err.error);
    if (problem === null) throw new Error('expected a problem detail');
    expect(problem.type).toBe('about:blank');
    expect(UI_KINDS.get(problemKey(problem, err.status))).toBe('conflict');
  });
});
