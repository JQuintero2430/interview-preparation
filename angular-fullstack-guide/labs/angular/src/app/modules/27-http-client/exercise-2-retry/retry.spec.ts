import {
  HttpClient,
  HttpContext,
  HttpErrorResponse,
  HttpInterceptorFn,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RETRY_CONFIG, RetryConfig } from './retry-config';
import { NO_RETRY, backoffMs, equalJitterMs, equalJitterRetryInterceptor, retryInterceptor } from './retry.interceptor';

const CONFIG: RetryConfig = { count: 3, baseMs: 100, random: () => 0.5 };

type DelayFn = (attempt: number, baseMs: number, random: number) => number;
type Variant = [string, HttpInterceptorFn, DelayFn, number[]];

const variants: Variant[] = [
  ['backoff with jitter', retryInterceptor, backoffMs, [100, 200, 400]],
  ['equal jitter', equalJitterRetryInterceptor, equalJitterMs, [75, 150, 300]],
];

const UNAVAILABLE = { status: 503, statusText: 'Service Unavailable' };

async function underFakeTimers(body: () => Promise<void>): Promise<void> {
  vi.useFakeTimers();
  try {
    await body();
  } finally {
    vi.useRealTimers();
  }
}

describe.each(variants)('E27.2 retry interceptor (%s)', (_name, interceptor, delayMs, expectedDelays) => {
  let http: HttpClient;
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([interceptor])),
        provideHttpClientTesting(),
        { provide: RETRY_CONFIG, useValue: CONFIG },
      ],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  it('a GET that keeps failing with 503 is sent count plus one times and then fails', () =>
    underFakeTimers(async () => {
      let failure: HttpErrorResponse | undefined;
      http.get('/r').subscribe({ error: (e: HttpErrorResponse) => (failure = e) });
      let sent = 0;
      for (let attempt = 0; attempt < CONFIG.count + 1; attempt++) {
        controller.expectOne('/r').flush(null, UNAVAILABLE);
        sent++;
        await vi.advanceTimersByTimeAsync(1000);
      }
      controller.expectNone('/r');
      expect(sent).toBe(4);
      expect(failure?.status).toBe(503);
    }));

  it('each retry waits longer than the previous one by the backoff factor', () =>
    underFakeTimers(async () => {
      http.get('/r').subscribe({ error: () => undefined });
      const computed = [1, 2, 3].map((attempt) => delayMs(attempt, CONFIG.baseMs, CONFIG.random()));
      expect(computed).toEqual(expectedDelays);
      expect(delayMs(2, 100, 0.3) / delayMs(1, 100, 0.3)).toBe(2);
      expect(delayMs(1, 100, 0)).toBeLessThan(delayMs(1, 100, 1));
      for (const delay of computed) {
        controller.expectOne('/r').flush(null, UNAVAILABLE);
        await vi.advanceTimersByTimeAsync(delay - 1);
        controller.expectNone('/r');
        await vi.advanceTimersByTimeAsync(1);
      }
      controller.expectOne('/r').flush(null, UNAVAILABLE);
    }));

  it('a 400 is not retried', () =>
    underFakeTimers(async () => {
      let failure: HttpErrorResponse | undefined;
      http.get('/r').subscribe({ error: (e: HttpErrorResponse) => (failure = e) });
      controller.expectOne('/r').flush(null, { status: 400, statusText: 'Bad Request' });
      await vi.advanceTimersByTimeAsync(1000);
      controller.expectNone('/r');
      expect(failure?.status).toBe(400);
    }));

  it('a POST is not retried', () =>
    underFakeTimers(async () => {
      let failure: HttpErrorResponse | undefined;
      http.post('/r', {}).subscribe({ error: (e: HttpErrorResponse) => (failure = e) });
      controller.expectOne('/r').flush(null, UNAVAILABLE);
      await vi.advanceTimersByTimeAsync(1000);
      controller.expectNone('/r');
      expect(failure?.status).toBe(503);
    }));

  it('a request with the NO_RETRY token is not retried', () =>
    underFakeTimers(async () => {
      let failure: HttpErrorResponse | undefined;
      const context = new HttpContext().set(NO_RETRY, true);
      http.get('/r', { context }).subscribe({ error: (e: HttpErrorResponse) => (failure = e) });
      controller.expectOne('/r').flush(null, UNAVAILABLE);
      await vi.advanceTimersByTimeAsync(1000);
      controller.expectNone('/r');
      expect(failure?.status).toBe(503);
    }));

  it('a GET that succeeds on the second attempt delivers the response', () =>
    underFakeTimers(async () => {
      let body: unknown;
      http.get('/r').subscribe((value) => (body = value));
      controller.expectOne('/r').flush(null, UNAVAILABLE);
      await vi.advanceTimersByTimeAsync(1000);
      controller.expectOne('/r').flush({ ok: 1 });
      expect(body).toEqual({ ok: 1 });
    }));
});
