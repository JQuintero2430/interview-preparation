import { HttpBackend, HttpClient, HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

interface LabM27User {
  id: number;
}

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

describe('Section 1: HttpClient versus fetch', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('Section 1: the default HttpBackend is the FetchBackend', () => {
    TestBed.configureTestingModule({});
    expect(TestBed.inject(HttpClient)).toBeInstanceOf(HttpClient);
    expect(TestBed.inject(HttpBackend).constructor.name).toBe('FetchBackend');
  });

  it('Section 1: a 404 reaches the error channel as an HttpErrorResponse', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const http = TestBed.inject(HttpClient);
    const controller = TestBed.inject(HttpTestingController);
    let nextCount = 0;
    let failure: HttpErrorResponse | undefined;
    http.get('/missing').subscribe({
      next: () => nextCount++,
      error: (e: HttpErrorResponse) => (failure = e),
    });
    controller.expectOne('/missing').flush({ code: 'NF' }, { status: 404, statusText: 'Not Found' });
    expect(nextCount).toBe(0);
    expect(failure).toBeInstanceOf(HttpErrorResponse);
    expect(failure?.status).toBe(404);
    expect(failure?.ok).toBe(false);
    expect(failure?.error).toEqual({ code: 'NF' });
    expect(failure?.message).toBe('Http failure response for /missing: 404 Not Found');
    controller.verify();
  });

  it('Section 1: a 404 from plain fetch resolves with ok false', async () => {
    const stub = vi.fn(async () => new Response('', { status: 404 }));
    vi.stubGlobal('fetch', stub);
    const response = await fetch('/missing');
    expect(response.ok).toBe(false);
    expect(response.status).toBe(404);
    expect(stub).toHaveBeenCalledTimes(1);
  });

  it('Section 1: the default backend calls fetch with an AbortSignal', () => {
    const calls: FetchCall[] = [];
    vi.stubGlobal('fetch', pendingFetch(calls));
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    const subscription = TestBed.inject(HttpClient).get('/pending').subscribe();
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe('/pending');
    expect(calls[0].init.method).toBe('GET');
    expect(calls[0].init.signal).toBeInstanceOf(AbortSignal);
    expect(calls[0].init.signal?.aborted).toBe(false);
    subscription.unsubscribe();
  });

  it('Section 1: unsubscribing aborts the fetch signal', () => {
    const calls: FetchCall[] = [];
    vi.stubGlobal('fetch', pendingFetch(calls));
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    const subscription = TestBed.inject(HttpClient).get('/pending').subscribe();
    const signal = calls[0].init.signal;
    expect(signal?.aborted).toBe(false);
    subscription.unsubscribe();
    expect(signal?.aborted).toBe(true);
  });

  it('Section 1: the type argument does not check the response', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const controller = TestBed.inject(HttpTestingController);
    let received: LabM27User | undefined;
    TestBed.inject(HttpClient)
      .get<LabM27User>('/u')
      .subscribe((user) => (received = user));
    controller.expectOne('/u').flush({ nope: true });
    expect(received).toEqual({ nope: true });
    controller.verify();
  });
});
