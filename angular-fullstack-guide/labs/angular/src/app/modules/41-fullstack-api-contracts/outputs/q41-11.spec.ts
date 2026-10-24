import { HttpClient, HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { type Observable, firstValueFrom } from 'rxjs';

/** Our Spring-shaped 400 body: what `MethodArgumentNotValidException`'s `ProblemDetail` renders, plus `instance`. */
const BAD_REQUEST_PROBLEM = {
  title: 'Bad Request',
  status: 400,
  detail: 'Invalid request content.',
  instance: '/api/orders/1',
};

/** Our stand-in for a gateway's error page. */
const BAD_GATEWAY_PAGE = '<html>Bad gateway</html>';

/** A fake `fetch` that answers by request URL: the same problem for two URLs, an HTML page for the third. */
function fakeFetch(): typeof fetch {
  return vi.fn<typeof fetch>(async (input) => {
    if (input === '/api/orders') {
      return new Response(BAD_GATEWAY_PAGE, { status: 502, headers: { 'content-type': 'text/html' } });
    }
    return new Response(JSON.stringify(BAD_REQUEST_PROBLEM), {
      status: 400,
      headers: { 'content-type': 'application/problem+json' },
    });
  });
}

async function failure(request: Observable<unknown>): Promise<HttpErrorResponse> {
  const outcome: unknown = await firstValueFrom(request).then(
    () => 'completed',
    (err: unknown) => err,
  );
  if (outcome instanceof HttpErrorResponse) return outcome;
  throw new Error(`expected an HttpErrorResponse, got ${String(outcome)}`);
}

describe('Q41.11 output: HttpErrorResponse.error on the default fetch backend', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('Q41.11 error is a parsed object, a Blob and a string by the request responseType', async () => {
    vi.stubGlobal('fetch', fakeFetch());
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    const http = TestBed.inject(HttpClient);

    const json = await failure(http.get('/api/orders/1'));
    expect(json.status).toBe(400);
    expect(json.error).toEqual(BAD_REQUEST_PROBLEM);

    const download = await failure(http.get('/api/orders/1/invoice', { responseType: 'blob' }));
    expect(download.status).toBe(400);
    expect(download.error).toBeInstanceOf(Blob);
    expect(download.error.type).toBe('application/problem+json');
    expect(JSON.parse(await download.error.text())).toEqual(BAD_REQUEST_PROBLEM);

    const gateway = await failure(http.get('/api/orders'));
    expect(gateway.status).toBe(502);
    expect(gateway.error).toBe(BAD_GATEWAY_PAGE);
  });
});
