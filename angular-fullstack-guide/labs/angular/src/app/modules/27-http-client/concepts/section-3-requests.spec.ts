import {
  HttpClient,
  HttpContext,
  HttpContextToken,
  HttpEvent,
  HttpEventType,
  HttpHeaders,
  HttpInterceptorFn,
  HttpParams,
  HttpRequest,
  HttpResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';

interface LabM27User {
  id: number;
  name: string;
}

const SKIP_LOG = new HttpContextToken<boolean>(() => false);

function isUser(value: unknown): value is LabM27User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'number' &&
    'name' in value &&
    typeof value.name === 'string'
  );
}

function parseUser(value: unknown): LabM27User {
  if (!isUser(value)) {
    throw new TypeError('Response is not a user');
  }
  return value;
}

describe('Section 3: making requests', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function setup(): { http: HttpClient; controller: HttpTestingController } {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    return { http: TestBed.inject(HttpClient), controller: TestBed.inject(HttpTestingController) };
  }

  it('Section 3: HttpParams.set returns a new instance and leaves the original empty', () => {
    const original = new HttpParams();
    const changed = original.set('a', '1');
    original.set('lost', '1');
    expect(original.toString()).toBe('');
    expect(changed.toString()).toBe('a=1');
    expect(changed.append('a', '2').set('b', 'x y').toString()).toBe('a=1&a=2&b=x%20y');
  });

  it('Section 3: a params object with an array repeats the key', () => {
    const { http, controller } = setup();
    http.get('/s', { params: { q: 'a b', page: 2, tags: ['x', 'y'] } }).subscribe();
    const request = controller.expectOne((req) => req.url === '/s');
    expect(request.request.urlWithParams).toBe('/s?q=a%20b&page=2&tags=x&tags=y');
    request.flush(null);
  });

  it('Section 3: HttpHeaders are immutable and read case-insensitively', () => {
    const original = new HttpHeaders({ A: '1' });
    const changed = original.set('B', '2');
    expect(original.has('B')).toBe(false);
    expect(changed.keys()).toEqual(['A', 'B']);
    const typed = new HttpHeaders({ 'Content-Type': 'application/json' });
    expect(typed.get('content-type')).toBe('application/json');
    expect(typed.keys()).toEqual(['Content-Type']);
  });

  it('Section 3: HttpRequest.clone returns a new request and leaves the original unchanged', () => {
    const original = new HttpRequest('GET', '/x');
    const copy = original.clone({ setHeaders: { A: '1' }, setParams: { p: '1' } });
    expect(copy).not.toBe(original);
    expect(original.headers.keys()).toEqual([]);
    expect(original.urlWithParams).toBe('/x');
    expect(copy.headers.keys()).toEqual(['A']);
    expect(copy.urlWithParams).toBe('/x?p=1');
  });

  it('Section 3: observe response exposes status and headers', () => {
    const { http, controller } = setup();
    let seen: HttpResponse<LabM27User> | undefined;
    http.get<LabM27User>('/r', { observe: 'response' }).subscribe((response) => (seen = response));
    controller.expectOne('/r').flush({ id: 1, name: 'Ada' }, { headers: { ETag: 'v1' } });
    expect(seen?.status).toBe(200);
    expect(seen?.ok).toBe(true);
    expect(seen?.headers.get('ETag')).toBe('v1');
    expect(seen?.body).toEqual({ id: 1, name: 'Ada' });
  });

  it('Section 3: observe events emits Sent then Response', () => {
    const { http, controller } = setup();
    const types: HttpEventType[] = [];
    http.get('/e', { observe: 'events' }).subscribe((event) => types.push(event.type));
    controller.expectOne('/e').flush({});
    expect(types).toEqual([HttpEventType.Sent, HttpEventType.Response]);
  });

  it('Section 3: observe events from an untyped options object is a type error', () => {
    const { http, controller } = setup();
    const options = { observe: 'events' };
    const types: HttpEventType[] = [];
    // @ts-expect-error TS2769: `observe` is widened to string, so no overload matches
    const events: Observable<HttpEvent<unknown>> = http.get('/v', options);
    events.subscribe((event) => types.push(event.type));
    controller.expectOne('/v').flush({});
    expect(types).toEqual([HttpEventType.Sent, HttpEventType.Response]);
  });

  it('Section 3: responseType text returns the raw string', () => {
    const { http, controller } = setup();
    let seen: string | undefined;
    http.get('/t', { responseType: 'text' }).subscribe((text) => (seen = text));
    const request = controller.expectOne('/t');
    request.flush('hello');
    expect(request.request.responseType).toBe('text');
    expect(seen).toBe('hello');
  });

  it('Section 3: a hand-written guard at the boundary turns a wrong shape into an error', () => {
    const { http, controller } = setup();
    let failure: unknown;
    let user: LabM27User | undefined;
    http.get<unknown>('/u').subscribe({
      next: (value) => {
        try {
          user = parseUser(value);
        } catch (error) {
          failure = error;
        }
      },
    });
    controller.expectOne('/u').flush({ nope: true });
    expect(user).toBeUndefined();
    expect(failure).toBeInstanceOf(TypeError);
    expect(isUser({ id: 1, name: 'Ada' })).toBe(true);
  });

  it('Section 3: a context token reaches the interceptor and not the server', async () => {
    const seen: string[] = [];
    const reader: HttpInterceptorFn = (req, next) => {
      seen.push(`ctx=${req.context.get(SKIP_LOG)}`);
      return next(req);
    };
    const calls: RequestInit[] = [];
    vi.stubGlobal('fetch', async (_input: RequestInfo | URL, init: RequestInit = {}) => {
      calls.push(init);
      return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
    });
    TestBed.configureTestingModule({ providers: [provideHttpClient(withInterceptors([reader]))] });
    const http = TestBed.inject(HttpClient);
    await new Promise((resolve) => http.get('/plain').subscribe(resolve));
    await new Promise((resolve) =>
      http.get('/flagged', { context: new HttpContext().set(SKIP_LOG, true) }).subscribe(resolve),
    );
    expect(seen).toEqual(['ctx=false', 'ctx=true']);
    expect(Object.keys(calls[1].headers ?? {})).toEqual(['Accept']);
  });

  it('Section 3: the timeout option is carried on the request', () => {
    const { http, controller } = setup();
    http.get('/slow', { timeout: 100 }).subscribe();
    const request = controller.expectOne('/slow');
    expect(request.request.timeout).toBe(100);
    request.flush(null);
  });

  it('Section 3: fetch options are forwarded to fetch', async () => {
    const calls: RequestInit[] = [];
    vi.stubGlobal('fetch', async (_input: RequestInfo | URL, init: RequestInit = {}) => {
      calls.push(init);
      return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
    });
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    await new Promise((resolve) =>
      TestBed.inject(HttpClient)
        .get('/f', { credentials: 'include', cache: 'no-store', keepalive: true })
        .subscribe(resolve),
    );
    expect(calls[0].credentials).toBe('include');
    expect(calls[0].cache).toBe('no-store');
    expect(calls[0].keepalive).toBe(true);
  });
});
