import { HttpClient, HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { contentRangeFor, planChunks, remainingChunks } from './chunk-plan';
import { FALLBACK_FILE_NAME, parseContentDisposition } from './content-disposition';
import { problemKey, readProblem } from './problem-details';

/** Our Spring-shaped 413: `MaxUploadSizeExceededException` carries `ProblemDetail.forStatusAndDetail(413, …)`. */
const TOO_LARGE_PROBLEM = { status: 413, detail: 'Maximum upload size exceeded', instance: '/api/files' };

/** Our example mapping from problem keys to the text a user sees. */
const FILE_MESSAGES = new Map([['413', 'The file is larger than the server accepts.']]);

function setUp(stub: typeof fetch): HttpClient {
  vi.stubGlobal('fetch', stub);
  TestBed.configureTestingModule({ providers: [provideHttpClient()] });
  return TestBed.inject(HttpClient);
}

describe('Section 8: files', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('Section 8: filename* wins over filename and is percent-decoded as UTF-8', () => {
    const header = `attachment; filename="naive cafe.txt"; filename*=UTF-8''na%C3%AFve%20caf%C3%A9.txt`;
    expect(parseContentDisposition(header)).toEqual({ type: 'attachment', filename: 'naïve café.txt' });
    expect(parseContentDisposition('attachment; filename="../../etc/passwd"').filename).toBe('passwd');
  });

  it('Section 8: a header without a file name gives the fallback name', () => {
    expect(parseContentDisposition('attachment').filename).toBe(FALLBACK_FILE_NAME);
    expect(parseContentDisposition('inline; filename=""').filename).toBe(FALLBACK_FILE_NAME);
    expect(parseContentDisposition(null)).toEqual({ type: '', filename: FALLBACK_FILE_NAME });
  });

  it('Section 8: a blob download reads Content-Disposition through observe response', async () => {
    const headers = {
      'content-type': 'text/csv',
      'content-disposition': `attachment; filename="export.csv"; filename*=UTF-8''r%C3%A9sum%C3%A9.csv`,
    };
    const http = setUp(vi.fn<typeof fetch>(async () => new Response('a,b', { status: 200, headers })));
    const response = await firstValueFrom(http.get('/api/export', { observe: 'response', responseType: 'blob' }));
    expect(response.body).toBeInstanceOf(Blob);
    expect(await response.body?.text()).toBe('a,b');
    expect(parseContentDisposition(response.headers.get('Content-Disposition')).filename).toBe('résumé.csv');
  });

  it('Section 8: a file is planned into chunks whose byte ranges cover it exactly once', () => {
    const plan = planChunks(12, 5);
    expect(plan.map((range) => contentRangeFor(range, 12))).toEqual(['bytes 0-4/12', 'bytes 5-9/12', 'bytes 10-11/12']);
    const seen = new Array<number>(12).fill(0);
    for (const range of plan) for (let byte = range.start; byte <= range.end; byte++) seen[byte]++;
    expect(seen).toEqual(new Array<number>(12).fill(1));
    expect(remainingChunks(plan, 5).map((range) => range.index)).toEqual([1, 2]);
    expect(planChunks(0, 5)).toEqual([]);
    expect(() => planChunks(12, 0)).toThrow(RangeError);
  });

  it('Section 8: a 413 problem from the upload limit maps to a file-too-large message', async () => {
    const stub = vi.fn<typeof fetch>(
      async () =>
        new Response(JSON.stringify(TOO_LARGE_PROBLEM), {
          status: 413,
          headers: { 'content-type': 'application/problem+json' },
        }),
    );
    const http = setUp(stub);
    const form = new FormData();
    form.append('file', new Blob(['x']), 'big.bin');
    const outcome: unknown = await firstValueFrom(http.post('/api/files', form)).then(
      () => 'completed',
      (err: unknown) => err,
    );
    if (!(outcome instanceof HttpErrorResponse)) throw new Error('expected an HttpErrorResponse');
    expect(stub.mock.calls[0][1]?.body).toBeInstanceOf(FormData);
    const problem = await readProblem(outcome.error);
    if (problem === null) throw new Error('expected a problem detail');
    expect(FILE_MESSAGES.get(problemKey(problem, outcome.status))).toBe('The file is larger than the server accepts.');
  });
});
