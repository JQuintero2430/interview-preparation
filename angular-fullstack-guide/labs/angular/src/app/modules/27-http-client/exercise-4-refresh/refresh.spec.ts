import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AuthStore, SKIP_AUTH, ShareAuthStore } from './auth-store';
import { API_ORIGIN, authInterceptor } from './auth.interceptor';

const ORIGIN = 'https://api.example.test';
const UNAUTHORIZED = { status: 401, statusText: 'Unauthorized' };

const variants: [string, Type<AuthStore>][] = [
  ['shareReplay with a field', AuthStore],
  ['share()', ShareAuthStore],
];

describe.each(variants)('E27.4 refresh on 401 (%s)', (_name, storeType) => {
  let http: HttpClient;
  let controller: HttpTestingController;
  let store: AuthStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: API_ORIGIN, useValue: ORIGIN },
        { provide: AuthStore, useClass: storeType },
      ],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
    store = TestBed.inject(AuthStore);
    store.accessToken.set('old');
  });

  afterEach(() => controller.verify());

  /** Sends one GET per URL and collects every outcome, so a test can flush in any order. */
  function sendAll(...urls: string[]): { bodies: unknown[]; errors: HttpErrorResponse[] } {
    const out = { bodies: [] as unknown[], errors: [] as HttpErrorResponse[] };
    for (const url of urls) {
      http.get(url).subscribe({
        next: (body) => out.bodies.push(body),
        error: (error: HttpErrorResponse) => out.errors.push(error),
      });
    }
    return out;
  }

  it('API requests carry the current bearer token', () => {
    sendAll('/api/a', `${ORIGIN}/api/b`);
    controller.expectOne('/api/a').flush({});
    controller.expectOne(`${ORIGIN}/api/b`).flush({});
    store.accessToken.set('newer');
    sendAll('/api/a');
    const request = controller.expectOne('/api/a');
    expect(request.request.headers.get('Authorization')).toBe('Bearer newer');
    request.flush({});
  });

  it('requests to other origins carry no token', () => {
    sendAll('https://other.example.test/api/a');
    const request = controller.expectOne('https://other.example.test/api/a');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({});
  });

  it('three concurrent 401s trigger exactly one refresh', () => {
    sendAll('/api/a', '/api/b', '/api/c');
    for (const url of ['/api/a', '/api/b', '/api/c']) {
      const request = controller.expectOne(url);
      expect(request.request.headers.get('Authorization')).toBe('Bearer old');
      request.flush(null, UNAUTHORIZED);
    }
    const refreshes = controller.match('/auth/refresh');
    expect(refreshes).toHaveLength(1);
    expect(refreshes[0].request.context.get(SKIP_AUTH)).toBe(true);
    expect(refreshes[0].request.headers.has('Authorization')).toBe(false);
    expect(store.refreshCalls()).toBe(1);
    refreshes[0].flush({ token: 'new' });
    for (const url of ['/api/a', '/api/b', '/api/c']) controller.expectOne(url).flush({});
  });

  it('every queued request is retried once with the new token', () => {
    const out = sendAll('/api/a', '/api/b');
    controller.expectOne('/api/a').flush(null, UNAUTHORIZED);
    controller.expectOne('/api/b').flush(null, UNAUTHORIZED);
    controller.expectOne('/auth/refresh').flush({ token: 'new' });
    for (const url of ['/api/a', '/api/b']) {
      const retry = controller.expectOne(url);
      expect(retry.request.headers.get('Authorization')).toBe('Bearer new');
      retry.flush({ ok: url });
    }
    expect(out.bodies).toEqual([{ ok: '/api/a' }, { ok: '/api/b' }]);
    expect(out.errors).toEqual([]);
  });

  it('a 401 from the refresh call logs out and fails the waiting requests', () => {
    const logout = vi.spyOn(store, 'logout');
    const out = sendAll('/api/a', '/api/b');
    controller.expectOne('/api/a').flush(null, UNAUTHORIZED);
    controller.expectOne('/api/b').flush(null, UNAUTHORIZED);
    controller.expectOne('/auth/refresh').flush(null, UNAUTHORIZED);
    expect(logout).toHaveBeenCalledTimes(1);
    expect(store.accessToken()).toBe('');
    expect(out.errors.map((error) => [error.status, error.url])).toEqual([
      [401, '/auth/refresh'],
      [401, '/auth/refresh'],
    ]);
    expect(out.bodies).toEqual([]);
  });

  it('a request that fails with 401 again after the refresh is not retried a second time', () => {
    const out = sendAll('/api/a');
    controller.expectOne('/api/a').flush(null, UNAUTHORIZED);
    controller.expectOne('/auth/refresh').flush({ token: 'new' });
    controller.expectOne('/api/a').flush(null, UNAUTHORIZED);
    expect(out.errors.map((error) => [error.status, error.url])).toEqual([[401, '/api/a']]);
    expect(store.refreshCalls()).toBe(1);
  });
});
