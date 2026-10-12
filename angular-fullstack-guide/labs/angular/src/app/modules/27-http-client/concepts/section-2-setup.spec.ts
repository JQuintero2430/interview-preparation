import {
  HttpBackend,
  HttpClient,
  HttpClientModule,
  HttpInterceptorFn,
  provideHttpClient,
  withInterceptors,
  withRequestsMadeViaParent,
  withXhr,
  withFetch,
  withNoXsrfProtection,
  withXsrfConfiguration,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { EnvironmentInjector, createEnvironmentInjector, importProvidersFrom } from '@angular/core';
import { TestBed } from '@angular/core/testing';

function jsonFetch(): ReturnType<typeof vi.fn<typeof fetch>> {
  return vi.fn<typeof fetch>(
    async () =>
      new Response(JSON.stringify({ ok: 1 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
  );
}

function backendName(): string {
  return TestBed.inject(HttpBackend).constructor.name;
}

function logging(log: string[], name: string): HttpInterceptorFn {
  return (req, next) => {
    log.push(name);
    return next(req);
  };
}

describe('Section 2: setting up HttpClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('Section 2: HttpClient works with no provider and uses the fetch backend', async () => {
    const stub = jsonFetch();
    vi.stubGlobal('fetch', stub);
    TestBed.configureTestingModule({});
    const body = await new Promise((resolve) => TestBed.inject(HttpClient).get('/api').subscribe(resolve));
    expect(body).toEqual({ ok: 1 });
    expect(stub).toHaveBeenCalledTimes(1);
    expect(backendName()).toBe('FetchBackend');
  });

  it('Section 2: provideHttpClient uses the fetch backend', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    expect(backendName()).toBe('FetchBackend');
  });

  it('Section 2: withXhr switches to the XHR backend', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(withXhr())] });
    expect(backendName()).toBe('HttpXhrBackend');
  });

  it('Section 2: withFetch still gives the fetch backend', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(withFetch())] });
    expect(backendName()).toBe('FetchBackend');
  });

  it('Section 2: HttpClientModule gives the XHR backend', () => {
    TestBed.configureTestingModule({ providers: [importProvidersFrom(HttpClientModule)] });
    expect(backendName()).toBe('HttpXhrBackend');
  });

  it('Section 2: provideHttpClientTesting after provideHttpClient swaps in the testing backend', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting()],
    });
    expect(backendName()).toBe('HttpClientTestingBackend');
  });

  it('Section 2: provideHttpClientTesting before provideHttpClient is overridden', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting(), provideHttpClient()],
    });
    expect(backendName()).toBe('FetchBackend');
  });

  it('Section 2: contradictory features throw in dev mode', () => {
    expect(() => provideHttpClient(withXsrfConfiguration({ cookieName: 'c' }), withNoXsrfProtection())).toThrow(
      'Configuration error: found both withXsrfConfiguration() and withNoXsrfProtection() in the same call to provideHttpClient(), which is a contradiction.',
    );
    expect(() => provideHttpClient(withRequestsMadeViaParent(), withXhr())).toThrow(
      'Configuration error: withRequestsMadeViaParent() cannot be combined with withFetch() or withXhr() in the same call to provideHttpClient().',
    );
  });

  it("Section 2: a child provideHttpClient ignores the parent's interceptors", async () => {
    const log: string[] = [];
    const stub = jsonFetch();
    vi.stubGlobal('fetch', stub);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([logging(log, 'parent')])),
        provideHttpClientTesting(),
      ],
    });
    const child = createEnvironmentInjector(
      [provideHttpClient(withInterceptors([logging(log, 'child')]))],
      TestBed.inject(EnvironmentInjector),
    );
    expect(child.get(HttpClient)).not.toBe(TestBed.inject(HttpClient));
    await new Promise((resolve) => child.get(HttpClient).get('/api').subscribe(resolve));
    expect(log).toEqual(['child']);
    expect(stub).toHaveBeenCalledTimes(1);
    expect(TestBed.inject(HttpTestingController).match('/api')).toHaveLength(0);
  });

  it("Section 2: withRequestsMadeViaParent runs the child's then the parent's interceptors", () => {
    const log: string[] = [];
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([logging(log, 'parent')])),
        provideHttpClientTesting(),
      ],
    });
    const child = createEnvironmentInjector(
      [provideHttpClient(withInterceptors([logging(log, 'child')]), withRequestsMadeViaParent())],
      TestBed.inject(EnvironmentInjector),
    );
    child.get(HttpClient).get('/api').subscribe();
    expect(log).toEqual(['child', 'parent']);
    expect(TestBed.inject(HttpTestingController).match('/api')).toHaveLength(1);
  });
});
