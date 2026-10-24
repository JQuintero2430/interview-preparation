import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationInitStatus, inject, provideAppInitializer } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LabM42AuthSession } from './auth-session';
import { LAB_M42_NAVIGATE } from './bff-client';
import { LabM42CsrfSession } from './csrf-session';

// The browser's hops of section 9's trace. Each TestBed is one page load: the first before sign-in, the next after the
// BFF's redirect back. Every server answer is our stub of the BFF; Spring's hops are read, not run. The real XSRF
// interceptor of provideHttpClient() reads document.cookie (jsdom); HttpTestingController does not process
// Set-Cookie, so the test writes the cookie the way the BFF's sign-in response would.
const XSRF_HEADER = 'X-XSRF-TOKEN';
const SIGNED_IN = { name: 'Ada' };
const UNAUTHORIZED = { status: 401, statusText: 'Unauthorized' };

function setXsrfCookie(value: string): void {
  document.cookie = `XSRF-TOKEN=${value}`;
}

function clearXsrfCookie(): void {
  document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

/** One page load: the app initializer asks our /api/me before the first route. */
function loadPage() {
  const navigate = vi.fn<(url: string) => void>();
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: LAB_M42_NAVIGATE, useValue: navigate },
      provideAppInitializer(() => inject(LabM42AuthSession).load()),
    ],
  });
  // The first inject builds the test module and starts the initializer, so /api/me is already pending.
  const controller = TestBed.inject(HttpTestingController);
  return {
    controller,
    navigate,
    session: TestBed.inject(LabM42AuthSession),
    initialized: TestBed.inject(ApplicationInitStatus).donePromise,
  };
}

describe('Section 9: one BFF login traced from the browser', () => {
  afterEach(() => clearXsrfCookie());

  it('Section 9: a signed-out start gets 401 from /api/me and leaves the page once for /oauth2/authorization/idp', async () => {
    const { controller, navigate, session, initialized } = loadPage();
    const me = controller.expectOne('/api/me');
    expect(me.request.headers.has('Authorization')).toBe(false);
    me.flush(null, UNAUTHORIZED);
    await initialized;
    expect(session.state()).toEqual({ status: 'anonymous' });
    expect(navigate).not.toHaveBeenCalled();

    session.startLogin();
    session.startLogin();

    expect(navigate).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledWith('/oauth2/authorization/idp');
    controller.verify();
  });

  it('Section 9: back from the IdP, the reloaded app loads the user and its GETs carry no X-XSRF-TOKEN', async () => {
    setXsrfCookie('sign-in-token');
    const { controller, navigate, session, initialized } = loadPage();
    const me = controller.expectOne('/api/me');
    expect(me.request.headers.has(XSRF_HEADER)).toBe(false);
    me.flush(SIGNED_IN);
    await initialized;
    expect(session.state()).toEqual({ status: 'signed-in', user: SIGNED_IN });

    TestBed.inject(LabM42CsrfSession).refresh().subscribe();
    const refresh = controller.expectOne({ method: 'GET', url: '/api/csrf' });
    expect(refresh.request.headers.has(XSRF_HEADER)).toBe(false);
    refresh.flush(null, { status: 204, statusText: 'No Content' });

    expect(navigate).not.toHaveBeenCalled();
    controller.verify();
  });

  it('Section 9: the first POST carries the sign-in XSRF-TOKEN and no Authorization header', async () => {
    setXsrfCookie('sign-in-token');
    const { controller, initialized } = loadPage();
    controller.expectOne('/api/me').flush(SIGNED_IN);
    await initialized;

    TestBed.inject(HttpClient).post('/api/orders', { item: 'book' }).subscribe();

    const post = controller.expectOne({ method: 'POST', url: '/api/orders' });
    expect(post.request.headers.get(XSRF_HEADER)).toBe('sign-in-token');
    expect(post.request.headers.has('Authorization')).toBe(false);
    post.flush({ id: 7 }, { status: 201, statusText: 'Created' });
    controller.verify();
  });
});
