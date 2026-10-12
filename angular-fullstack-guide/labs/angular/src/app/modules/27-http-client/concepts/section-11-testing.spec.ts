import {
  FetchBackend,
  HttpBackend,
  HttpClient,
  HttpInterceptorFn,
  HttpRequest,
  httpResource,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

const tagInterceptor: HttpInterceptorFn = (req, next) => next(req.clone({ setHeaders: { 'x-lab-m27': 'on' } }));

function messageOf(action: () => unknown): string {
  try {
    action();
  } catch (error) {
    return (error as Error).message;
  }
  return 'did not throw';
}

describe('Section 11: provideHttpClientTesting and HttpTestingController', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('Section 11: provideHttpClientTesting replaces the backend', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([tagInterceptor])), provideHttpClientTesting()],
    });
    expect(TestBed.inject(HttpBackend) instanceof FetchBackend).toBe(false);
    const values: unknown[] = [];
    TestBed.inject(HttpClient).get('/a').subscribe((value) => values.push(value));
    const request = TestBed.inject(HttpTestingController).expectOne('/a');
    expect(request.request.headers.get('x-lab-m27')).toBe('on');
    request.flush({ ok: 1 });
    expect(values).toEqual([{ ok: 1 }]);
  });

  it('Section 11: provideHttpClientTesting before provideHttpClient leaves the fetch backend', () => {
    const fake = vi.fn(() => Promise.resolve(new Response('{"ok":1}', { headers: { 'content-type': 'application/json' } })));
    vi.stubGlobal('fetch', fake);
    TestBed.configureTestingModule({ providers: [provideHttpClientTesting(), provideHttpClient()] });
    expect(TestBed.inject(HttpBackend) instanceof FetchBackend).toBe(true);
    TestBed.inject(HttpClient).get('/a').subscribe();
    expect(fake).toHaveBeenCalledTimes(1);
    expect(TestBed.inject(HttpTestingController).match(() => true)).toHaveLength(0);
  });

  it('Section 11: expectOne with no match names the criteria', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const controller = TestBed.inject(HttpTestingController);
    expect(messageOf(() => controller.expectOne('/nothing'))).toBe(
      'Expected one matching request for criteria "Match URL: /nothing", found none.',
    );
    TestBed.inject(HttpClient).get('/other').subscribe();
    expect(messageOf(() => controller.expectOne({ method: 'POST', url: '/nothing' }))).toBe(
      'Expected one matching request for criteria "Match method: POST, URL: /nothing", found none. Requests received are: GET /other.',
    );
    const isPost = (req: HttpRequest<unknown>): boolean => req.method === 'POST';
    expect(messageOf(() => controller.expectOne(isPost))).toBe(
      'Expected one matching request for criteria "Match by function: isPost", found none. Requests received are: GET /other.',
    );
    expect(controller.match((req) => req.url === '/other')).toHaveLength(1);
  });

  it('Section 11: verify lists the open requests', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const controller = TestBed.inject(HttpTestingController);
    const http = TestBed.inject(HttpClient);
    http.get('/pending').subscribe();
    expect(messageOf(() => controller.verify())).toBe('Expected no open requests, found 1: GET /pending');
    const cancelled = http.get('/gone').subscribe();
    cancelled.unsubscribe();
    expect(messageOf(() => controller.verify({ ignoreCancelled: true }))).toBe(
      'Expected no open requests, found 1: GET /pending',
    );
    expect(messageOf(() => controller.expectNone('/pending'))).toBe(
      'Expected zero matching requests for criteria "Match URL: /pending", found 1.',
    );
    controller.expectOne('/gone');
    controller.verify();
  });

  it('Section 11: test requests do not hold whenStable', async () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const controller = TestBed.inject(HttpTestingController);
    TestBed.inject(HttpClient).get('/slow').subscribe();
    await TestBed.inject(ApplicationRef).whenStable();
    expect(controller.match('/slow')).toHaveLength(1);
  });

  it('Section 11: the testing backend never fires a timeout', async () => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const controller = TestBed.inject(HttpTestingController);
    const errors: unknown[] = [];
    TestBed.inject(HttpClient)
      .get('/t', { timeout: 100 })
      .subscribe({ error: (error: unknown) => errors.push(error) });
    await vi.advanceTimersByTimeAsync(500);
    const request = controller.expectOne('/t');
    expect(errors).toHaveLength(0);
    expect(request.cancelled).toBe(false);
    expect(request.request.timeout).toBe(100);
  });

  it('Section 11: an httpResource value lands after whenStable, not after tick', async () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const controller = TestBed.inject(HttpTestingController);
    const resource = TestBed.runInInjectionContext(() => httpResource<{ id: number }>(() => '/r'));
    TestBed.tick();
    controller.expectOne('/r').flush({ id: 1 });
    TestBed.tick();
    expect(resource.status()).toBe('loading');
    await TestBed.inject(ApplicationRef).whenStable();
    expect(resource.status()).toBe('resolved');
    expect(resource.value()).toEqual({ id: 1 });
  });
});
