import {
  HttpClient,
  HttpErrorResponse,
  type HttpInterceptorFn,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { type Observable, catchError, firstValueFrom, from, switchMap, tap, throwError } from 'rxjs';
import { parsePointer } from './json-pointer';
import { type Problem, readProblem } from './problem-details';

/** Our Spring-shaped 400: what our advice renders for an invalid email and a too-long street. */
const INVALID_CUSTOMER_PROBLEM = {
  type: 'https://api.example.com/problems/validation',
  title: 'Bad Request',
  status: 400,
  detail: 'Invalid request content.',
  instance: '/api/customers',
  errors: [
    { pointer: '#/email', detail: 'Enter a valid email' },
    { pointer: '#/address/street', detail: 'At most 80 characters' },
  ],
};

/** Our error type: the mapping interceptor's output, so call sites never parse bodies. */
class ProblemError extends Error {
  constructor(
    readonly problem: Problem,
    readonly status: number,
  ) {
    super(problem.title ?? `HTTP ${status}`);
  }
}

/** Records each request on the way out and each error on the way back. */
function logging(log: string[], name: string): HttpInterceptorFn {
  return (req, next) => {
    log.push(`${name} req`);
    return next(req).pipe(
      tap({
        error: (error: unknown) =>
          log.push(`${name} error ${error instanceof HttpErrorResponse ? error.status : 'other'}`),
      }),
    );
  };
}

/** A problem body becomes a ProblemError; a status-0 failure has no body, so it passes through unread. */
async function toProblemError(error: unknown): Promise<unknown> {
  if (!(error instanceof HttpErrorResponse) || error.status === 0) return error;
  const problem = await readProblem(error.error);
  return problem ? new ProblemError(problem, error.status) : error;
}

/** Our mapping interceptor, listed first, so it sees the error last. */
const mapProblems: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((error: unknown) => from(toProblemError(error)).pipe(switchMap((mapped) => throwError(() => mapped)))),
  );

function buildForm() {
  return new FormGroup({
    email: new FormControl('ana@', { nonNullable: true }),
    address: new FormGroup({ street: new FormControl('x'.repeat(81), { nonNullable: true }) }),
  });
}

function setUp(stub: typeof fetch, log: string[]): HttpClient {
  vi.stubGlobal('fetch', stub);
  TestBed.configureTestingModule({
    providers: [provideHttpClient(withInterceptors([mapProblems, logging(log, 'A'), logging(log, 'B')]))],
  });
  return TestBed.inject(HttpClient);
}

async function failure(request: Observable<unknown>): Promise<unknown> {
  return firstValueFrom(request).then(
    () => 'completed',
    (error: unknown) => error,
  );
}

describe('Section 10: one failed request through both stacks', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function answerWithProblem(log: string[]): typeof fetch {
    return vi.fn<typeof fetch>(async () => {
      log.push('fetch');
      return new Response(JSON.stringify(INVALID_CUSTOMER_PROBLEM), {
        status: 400,
        headers: { 'content-type': 'application/problem+json' },
      });
    });
  }

  it('Section 10: the interceptors see the request in order and the error in reverse order', async () => {
    const log: string[] = [];
    const http = setUp(answerWithProblem(log), log);
    const error = await failure(http.post('/api/customers', buildForm().getRawValue()));
    expect(log).toEqual(['A req', 'B req', 'fetch', 'B error 400', 'A error 400']);
    expect(error).toBeInstanceOf(ProblemError);
  });

  it("Section 10: the problem's errors reach the form controls after the chain", async () => {
    const log: string[] = [];
    const http = setUp(answerWithProblem(log), log);
    const form = buildForm();
    const error = await failure(http.post('/api/customers', form.getRawValue()));
    if (!(error instanceof ProblemError)) throw new Error('expected a ProblemError');
    for (const entry of error.problem.errors) {
      form.get([...parsePointer(entry.pointer)])?.setErrors({ server: entry.detail });
    }
    expect(error.status).toBe(400);
    expect(form.controls.email.errors).toEqual({ server: 'Enter a valid email' });
    expect(form.controls.address.controls.street.errors).toEqual({ server: 'At most 80 characters' });
  });

  it('Section 10: a failure before the response (a CORS block seen as status 0) never reaches the problem reader', async () => {
    const log: string[] = [];
    const blocked = vi.fn<typeof fetch>(async () => {
      log.push('fetch');
      throw new TypeError('Failed to fetch');
    });
    const http = setUp(blocked, log);
    const error = await failure(http.post('/api/customers', buildForm().getRawValue()));
    expect(log).toEqual(['A req', 'B req', 'fetch', 'B error 0', 'A error 0']);
    if (!(error instanceof HttpErrorResponse)) throw new Error('expected the HttpErrorResponse unchanged');
    expect(error.status).toBe(0);
    expect(error.error).toBeInstanceOf(TypeError);
    expect(await readProblem(error.error)).toBeNull();
  });
});
