import {
  HttpClient,
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Injectable, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, of, shareReplay, tap } from 'rxjs';

type FetchCall = { url: string; init: RequestInit };

/** A fake `fetch` that records its calls and stays pending until its signal aborts. */
function pendingFetch(calls: FetchCall[]): typeof fetch {
  return (input, init = {}) => {
    calls.push({ url: String(input), init });
    return new Promise<Response>((_resolve, reject) => {
      init.signal?.addEventListener('abort', () => reject(init.signal?.reason));
    });
  };
}

/** The naive cache of the section: GET only, keyed by the URL with its parameters. */
function naiveCache(store: Map<string, HttpResponse<unknown>>): HttpInterceptorFn {
  return (req, next) => {
    if (req.method !== 'GET') return next(req);
    const hit = store.get(req.urlWithParams);
    if (hit) return of(hit.clone());
    return next(req).pipe(
      tap((event) => {
        if (event instanceof HttpResponse) store.set(req.urlWithParams, event);
      }),
    );
  };
}

@Injectable({ providedIn: 'root' })
class LabM27ReferenceService {
  private readonly http = inject(HttpClient);
  readonly countries$: Observable<string[]> = this.http.get<string[]>('/countries').pipe(shareReplay(1));
}

describe('Section 6: cancellation and caching', () => {
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

  it('Section 6: unsubscribing aborts the fetch request', () => {
    const calls: FetchCall[] = [];
    vi.stubGlobal('fetch', pendingFetch(calls));
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    const received: string[] = [];
    const subscription = TestBed.inject(HttpClient)
      .get('/slow')
      .subscribe({ next: () => received.push('next'), error: () => received.push('error') });
    expect(calls).toHaveLength(1);
    const signal = calls[0].init.signal;
    expect(signal?.aborted).toBe(false);
    subscription.unsubscribe();
    expect(signal?.aborted).toBe(true);
    expect((signal?.reason as DOMException).name).toBe('AbortError');
    expect(received).toEqual([]);
  });

  it('Section 6: a completed request is not aborted by its teardown', async () => {
    const calls: FetchCall[] = [];
    vi.stubGlobal('fetch', (input: RequestInfo | URL, init: RequestInit = {}) => {
      calls.push({ url: String(input), init });
      return Promise.resolve(new Response('{"ok":1}', { headers: { 'content-type': 'application/json' } }));
    });
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    const body = await new Promise((resolve) => TestBed.inject(HttpClient).get('/done').subscribe(resolve));
    expect(body).toEqual({ ok: 1 });
    expect(calls[0].init.signal?.aborted).toBe(false);
  });

  it('Section 6: a timeout aborts the fetch with a TimeoutError and status 0', async () => {
    vi.useFakeTimers();
    try {
      const calls: FetchCall[] = [];
      vi.stubGlobal('fetch', pendingFetch(calls));
      TestBed.configureTestingModule({ providers: [provideHttpClient()] });
      let failure: HttpErrorResponse | undefined;
      TestBed.inject(HttpClient)
        .get('/t', { timeout: 100 })
        .subscribe({ error: (e: HttpErrorResponse) => (failure = e) });
      await vi.advanceTimersByTimeAsync(150);
      expect(calls[0].init.signal?.aborted).toBe(true);
      expect(failure?.status).toBe(0);
      expect((failure?.error as DOMException).name).toBe('TimeoutError');
      expect(failure?.message).toBe('Http failure response for /t: 0 undefined');
    } finally {
      vi.useRealTimers();
    }
  });

  it('Section 6: the testing backend marks an unsubscribed request cancelled', () => {
    const { http, controller } = testing();
    const subscription = http.get('/slow').subscribe();
    const request = controller.expectOne('/slow');
    expect(request.cancelled).toBe(false);
    subscription.unsubscribe();
    expect(request.cancelled).toBe(true);
  });

  it('Section 6: the testing backend does not simulate a timeout', async () => {
    vi.useFakeTimers();
    try {
      const { http, controller } = testing();
      const outcomes: string[] = [];
      http.get('/t', { timeout: 100 }).subscribe({ next: () => outcomes.push('next'), error: () => outcomes.push('error') });
      await vi.advanceTimersByTimeAsync(500);
      const request = controller.expectOne('/t');
      expect(outcomes).toEqual([]);
      expect(request.cancelled).toBe(false);
      expect(request.request.timeout).toBe(100);
    } finally {
      vi.useRealTimers();
    }
  });

  it('Section 6: a cache interceptor answers the second GET without the backend', () => {
    const { http, controller } = testing(naiveCache(new Map()));
    const bodies: unknown[] = [];
    http.get('/p').subscribe((body) => bodies.push(body));
    controller.expectOne('/p').flush({ v: 1 });
    http.get('/p').subscribe((body) => bodies.push(body));
    controller.expectNone('/p');
    expect(bodies).toEqual([{ v: 1 }, { v: 1 }]);
  });

  it('Section 6: a naive cache sends two requests for two concurrent GETs', () => {
    const { http, controller } = testing(naiveCache(new Map()));
    http.get('/q').subscribe();
    http.get('/q').subscribe();
    expect(controller.match('/q')).toHaveLength(2);
  });

  it('Section 6: a URL-keyed cache serves one user response to another user', () => {
    const { http, controller } = testing(naiveCache(new Map()));
    const names: unknown[] = [];
    http.get('/me', { headers: { Authorization: 'Bearer ann' } }).subscribe((body) => names.push(body));
    controller.expectOne('/me').flush({ name: 'Ann' });
    http.get('/me', { headers: { Authorization: 'Bearer bo' } }).subscribe((body) => names.push(body));
    controller.expectNone('/me');
    expect(names).toEqual([{ name: 'Ann' }, { name: 'Ann' }]);
  });

  it('Section 6: shareReplay in a service shares one request between subscribers', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const countries$ = TestBed.inject(LabM27ReferenceService).countries$;
    const controller = TestBed.inject(HttpTestingController);
    const seen: string[][] = [];
    countries$.subscribe((list) => seen.push(list));
    countries$.subscribe((list) => seen.push(list));
    controller.expectOne('/countries').flush(['CL', 'CO']);
    countries$.subscribe((list) => seen.push(list));
    controller.expectNone('/countries');
    expect(seen).toEqual([['CL', 'CO'], ['CL', 'CO'], ['CL', 'CO']]);
  });
});
