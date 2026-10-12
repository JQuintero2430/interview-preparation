import {
  HttpClient,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpXsrfTokenExtractor,
  provideHttpClient,
  withInterceptors,
  withNoXsrfProtection,
  withXsrfConfiguration,
} from '@angular/common/http';
import type { HttpFeature, HttpFeatureKind } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PlatformLocation } from '@angular/common';
import { inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';

const COOKIE_NAMES = ['XSRF-TOKEN', 'MY'];

function setCookie(name: string, value: string): void {
  document.cookie = `${name}=${value}`;
}

function expireCookies(): void {
  for (const name of COOKIE_NAMES) document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

/** The origin the interceptor compares against: TestBed's fake location, not `document.location`. */
function pageOrigin(): string {
  return new URL(TestBed.inject(PlatformLocation).href).origin;
}

/** A design for a trusted cross-origin API: the app adds the header itself. */
const trustedOriginXsrf: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const token = inject(HttpXsrfTokenExtractor).getToken();
  const trusted = new URL(req.url, 'https://app.example.test').origin === 'https://api.example.test';
  return next(trusted && token !== null ? req.clone({ setHeaders: { 'X-XSRF-TOKEN': token } }) : req);
};

describe('Section 8: XSRF protection', () => {
  let controller: HttpTestingController;
  let http: HttpClient;

  function setup(...features: HttpFeature<HttpFeatureKind>[]): void {
    TestBed.configureTestingModule({ providers: [provideHttpClient(...features), provideHttpClientTesting()] });
    controller = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
  }

  afterEach(() => {
    controller.verify();
    expireCookies();
  });

  it('Section 8: a relative POST carries the XSRF header', () => {
    setCookie('XSRF-TOKEN', 'abc');
    setup();
    http.post('/api/a', {}).subscribe();
    expect(controller.expectOne('/api/a').request.headers.get('X-XSRF-TOKEN')).toBe('abc');
  });

  it('Section 8: GET and HEAD carry no XSRF header', () => {
    setCookie('XSRF-TOKEN', 'abc');
    setup();
    http.get('/api/b').subscribe();
    http.head('/api/h').subscribe();
    expect(controller.expectOne('/api/b').request.headers.has('X-XSRF-TOKEN')).toBe(false);
    expect(controller.expectOne('/api/h').request.headers.has('X-XSRF-TOKEN')).toBe(false);
  });

  it('Section 8: a request without the cookie carries no XSRF header', () => {
    setup();
    http.post('/api/a', {}).subscribe();
    expect(controller.expectOne('/api/a').request.headers.has('X-XSRF-TOKEN')).toBe(false);
  });

  it('Section 8: a cross-origin or protocol-relative request carries no XSRF header', () => {
    setCookie('XSRF-TOKEN', 'abc');
    setup();
    http.put('https://other.example/api/c', {}).subscribe();
    http.delete('//other.example/api/e').subscribe();
    expect(controller.expectOne('https://other.example/api/c').request.headers.has('X-XSRF-TOKEN')).toBe(false);
    expect(controller.expectOne('//other.example/api/e').request.headers.has('X-XSRF-TOKEN')).toBe(false);
  });

  it('Section 8: a same-origin absolute URL carries the XSRF header', () => {
    setCookie('XSRF-TOKEN', 'abc');
    setup();
    expect(pageOrigin()).toBe('http://_empty_');
    const url = `${pageOrigin()}/api/d`;
    http.post(url, {}).subscribe();
    expect(controller.expectOne(url).request.headers.get('X-XSRF-TOKEN')).toBe('abc');
  });

  it('Section 8: an explicit header is not overwritten', () => {
    setCookie('XSRF-TOKEN', 'abc');
    setup();
    http.post('/api/f', {}, { headers: { 'X-XSRF-TOKEN': 'mine' } }).subscribe();
    expect(controller.expectOne('/api/f').request.headers.get('X-XSRF-TOKEN')).toBe('mine');
  });

  it('Section 8: withXsrfConfiguration renames the cookie and the header', () => {
    setCookie('XSRF-TOKEN', 'abc');
    setCookie('MY', 'zzz');
    setup(withXsrfConfiguration({ cookieName: 'MY', headerName: 'X-MY' }));
    http.post('/api/g', {}).subscribe();
    const { headers } = controller.expectOne('/api/g').request;
    expect(headers.get('X-MY')).toBe('zzz');
    expect(headers.has('X-XSRF-TOKEN')).toBe(false);
  });

  it('Section 8: withNoXsrfProtection sends no header', () => {
    setCookie('XSRF-TOKEN', 'abc');
    setup(withNoXsrfProtection());
    http.post('/api/h', {}).subscribe();
    expect(controller.expectOne('/api/h').request.headers.has('X-XSRF-TOKEN')).toBe(false);
  });

  it('Section 8: the root-provided client sends the XSRF header without provideHttpClient', () => {
    setCookie('XSRF-TOKEN', 'abc');
    TestBed.configureTestingModule({ providers: [provideHttpClientTesting()] });
    controller = TestBed.inject(HttpTestingController);
    TestBed.inject(HttpClient).post('/api/i', {}).subscribe();
    expect(controller.expectOne('/api/i').request.headers.get('X-XSRF-TOKEN')).toBe('abc');
  });

  it('Section 8: a custom token extractor supplies the token', () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: HttpXsrfTokenExtractor, useValue: { getToken: () => 'from-extractor' } },
      ],
    });
    controller = TestBed.inject(HttpTestingController);
    TestBed.inject(HttpClient).post('/api/j', {}).subscribe();
    expect(controller.expectOne('/api/j').request.headers.get('X-XSRF-TOKEN')).toBe('from-extractor');
  });

  it('Section 8: an interceptor can add the header for a trusted cross-origin API', () => {
    setCookie('XSRF-TOKEN', 'abc');
    setup(withInterceptors([trustedOriginXsrf]));
    http.post('https://api.example.test/api/k', {}).subscribe();
    http.post('https://other.example/api/l', {}).subscribe();
    expect(controller.expectOne('https://api.example.test/api/k').request.headers.get('X-XSRF-TOKEN')).toBe('abc');
    expect(controller.expectOne('https://other.example/api/l').request.headers.has('X-XSRF-TOKEN')).toBe(false);
  });
});
