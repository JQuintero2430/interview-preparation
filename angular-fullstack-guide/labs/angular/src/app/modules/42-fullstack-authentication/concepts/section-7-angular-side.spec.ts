import {
  HttpClient,
  type HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationInitStatus, inject, provideAppInitializer } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { LabM42AuthSession } from './auth-session';
import { requireSession, safeReturnUrl, skipLoginWhenSignedIn } from './auth.guard';
import { redirectOn401 } from './auth.interceptor';
import { LAB_M42_NAVIGATE } from './bff-client';

// Every server answer is our stub of a BFF's /api/me and /api/orders. The router runs for real, without an outlet.
const SIGNED_IN = { name: 'Ada' };
const UNAUTHORIZED = { status: 401, statusText: 'Unauthorized' };

function setUp() {
  const navigate = vi.fn<(url: string) => void>();
  TestBed.configureTestingModule({
    providers: [
      provideRouter([
        { path: '', pathMatch: 'full', children: [] },
        { path: 'login', canActivate: [skipLoginWhenSignedIn], children: [] },
        { path: 'orders/:id', canMatch: [requireSession], children: [] },
      ]),
      provideHttpClient(withInterceptors([redirectOn401])),
      provideHttpClientTesting(),
      { provide: LAB_M42_NAVIGATE, useValue: navigate },
      provideAppInitializer(() => inject(LabM42AuthSession).load()),
    ],
  });
  // The first inject builds the test module and starts the initializers, so /api/me is already pending.
  const controller = TestBed.inject(HttpTestingController);
  return {
    controller,
    navigate,
    router: TestBed.inject(Router),
    session: TestBed.inject(LabM42AuthSession),
    initialized: TestBed.inject(ApplicationInitStatus).donePromise,
  };
}

describe('Section 7: the Angular side of a BFF session', () => {
  it('Section 7: the app initializer loads the session before the first navigation', async () => {
    const { controller, router, session, initialized } = setUp();
    expect(session.state()).toEqual({ status: 'unknown' });

    controller.expectOne('/api/me').flush(SIGNED_IN);
    await initialized;
    expect(session.state()).toEqual({ status: 'signed-in', user: SIGNED_IN });

    await router.navigateByUrl('/orders/42');
    expect(router.url).toBe('/orders/42');
    controller.verify();
  });

  it('Section 7: a signed-out user is redirected to login with the requested URL as returnUrl', async () => {
    const { controller, navigate, router, session, initialized } = setUp();
    controller.expectOne('/api/me').flush(null, UNAUTHORIZED);
    await initialized;
    expect(session.state()).toEqual({ status: 'anonymous' });
    expect(navigate).not.toHaveBeenCalled();

    await router.navigateByUrl('/orders/42?tab=notes');

    const landed = router.parseUrl(router.url);
    expect(router.url.split('?')[0]).toBe('/login');
    expect(landed.queryParams['returnUrl']).toBe('/orders/42?tab=notes');
    controller.verify();
  });

  it('Section 7: a returnUrl pointing to another origin is replaced by the home path', async () => {
    const { controller, router, initialized } = setUp();
    controller.expectOne('/api/me').flush(SIGNED_IN);
    await initialized;

    await router.navigateByUrl(
      `/login?returnUrl=${encodeURIComponent('https://evil.example/steal')}`,
    );
    expect(router.url).toBe('/');
    await router.navigateByUrl(`/login?returnUrl=${encodeURIComponent('/orders/42')}`);
    expect(router.url).toBe('/orders/42');

    // The URL parser moves each of these to another origin or to no origin at all.
    for (const raw of [
      '//evil.example/x',
      '/\\evil.example',
      '/\t/evil.example',
      'javascript:alert(1)',
      'http://[',
    ]) {
      expect(safeReturnUrl(raw)).toBe('/');
    }
    expect(safeReturnUrl('/orders/42?tab=1#top')).toBe('/orders/42?tab=1#top');
    expect(safeReturnUrl(null)).toBe('/');
    controller.verify();
  });

  it('Section 7: three parallel 401s start one login redirect', async () => {
    const { controller, navigate, initialized } = setUp();
    controller.expectOne('/api/me').flush(SIGNED_IN);
    await initialized;

    const http = TestBed.inject(HttpClient);
    const statuses: number[] = [];
    for (const path of ['/api/orders', '/api/profile', '/api/invoices']) {
      http
        .get(path)
        .subscribe({ error: (error: HttpErrorResponse) => statuses.push(error.status) });
    }
    for (const pending of controller.match(() => true)) pending.flush(null, UNAUTHORIZED);

    expect(statuses).toEqual([401, 401, 401]);
    expect(navigate).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledWith('/oauth2/authorization/idp');
    controller.verify();
  });
});
