import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting, type TestRequest } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { LabM42CsrfSession } from './csrf-session';

// The real XSRF interceptor of provideHttpClient() reads document.cookie (jsdom). HttpTestingController does not
// process Set-Cookie, so each server answer below is our stub: the test writes or expires the cookie the way the
// response's Set-Cookie header would (Spring clears it on sign-in and logout; our /api/csrf writes a new one).
const HEADER = 'X-XSRF-TOKEN';
const CREDENTIALS = { username: 'ana', password: 'secret' };

function setXsrfCookie(value: string): void {
  document.cookie = `XSRF-TOKEN=${value}`;
}

function clearXsrfCookie(): void {
  document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

function noContent(req: TestRequest): void {
  req.flush(null, { status: 204, statusText: 'No Content' });
}

function setUp() {
  TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
  return {
    controller: TestBed.inject(HttpTestingController),
    http: TestBed.inject(HttpClient),
    session: TestBed.inject(LabM42CsrfSession),
  };
}

describe('Section 6: CSRF tokens with csrf.spa()', () => {
  afterEach(() => clearXsrfCookie());

  it('Section 6: the POST after login carries the rotated XSRF-TOKEN value', () => {
    const { controller, http, session } = setUp();
    setXsrfCookie('anonymous-token');

    session.login(CREDENTIALS).subscribe();
    const login = controller.expectOne('/login');
    expect(login.request.headers.get(HEADER)).toBe('anonymous-token');
    clearXsrfCookie();
    login.flush('');

    const refresh = controller.expectOne('/api/csrf');
    expect(refresh.request.headers.has(HEADER)).toBe(false);
    setXsrfCookie('signed-in-token');
    noContent(refresh);

    http.post('/api/orders', {}).subscribe();
    expect(controller.expectOne('/api/orders').request.headers.get(HEADER)).toBe('signed-in-token');
    controller.verify();
  });

  it('Section 6: the client fetches a fresh token after login and after logout', () => {
    const { controller, http, session } = setUp();
    setXsrfCookie('anonymous-token');
    session.login(CREDENTIALS).subscribe();
    clearXsrfCookie();
    controller.expectOne('/login').flush('');
    setXsrfCookie('signed-in-token');
    noContent(controller.expectOne({ method: 'GET', url: '/api/csrf' }));

    session.logout().subscribe();
    const logout = controller.expectOne('/logout');
    expect(logout.request.method).toBe('POST');
    expect(logout.request.headers.get(HEADER)).toBe('signed-in-token');
    clearXsrfCookie();
    logout.flush('');

    // Until the refresh answers, there is no cookie, so a POST would leave without the header.
    const refresh = controller.expectOne({ method: 'GET', url: '/api/csrf' });
    http.post('/api/early', {}).subscribe();
    expect(controller.expectOne('/api/early').request.headers.has(HEADER)).toBe(false);
    setXsrfCookie('signed-out-token');
    noContent(refresh);

    http.post('/api/feedback', {}).subscribe();
    expect(controller.expectOne('/api/feedback').request.headers.get(HEADER)).toBe('signed-out-token');
    controller.verify();
  });
});
