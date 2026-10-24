import { HttpClient, type HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, type TestRequest, provideHttpClientTesting } from '@angular/common/http/testing';
import type { EnvironmentProviders } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NavigationStart, Router, RoutesRecognized, provideRouter } from '@angular/router';
import { provideSessionStore } from './a/session.store';
import { provideSessionResource } from './b/session.resource';
import { leaveLoginWhenSignedIn, requireSession } from './guard';
import {
  LOGGED_OUT,
  LOGIN_NAVIGATION,
  LOGIN_URL,
  ME_URL,
  Session,
  type SessionState,
  TAB_CHANNEL,
  type TabChannel,
  type TabMessage,
} from './session';
import { expireOn401 } from './unauthorized.interceptor';

// Every server answer is our stub of a BFF: /api/me, our /api/csrf (204, the token rides in Set-Cookie) and the API.
type Variant = 'a' | 'b';
const VARIANTS: readonly Variant[] = ['a', 'b'];
const PROVIDE_SESSION: Record<Variant, () => EnvironmentProviders> = {
  a: provideSessionStore,
  b: provideSessionResource,
};

const CSRF_URL = '/api/csrf';
const USER = { name: 'Ada' };
const SIGNED_IN: SessionState = { status: 'signed-in', user: USER };
const UNAUTHORIZED = { status: 401, statusText: 'Unauthorized' };
const NO_CONTENT = { status: 204, statusText: 'No Content' };

/** Another tab, as far as this tab can tell: what we post is recorded, and `deliver` plays a message from it. */
class FakeTabChannel implements TabChannel {
  readonly posted: TabMessage[] = [];
  private readonly handlers: ((message: unknown) => void)[] = [];

  post(message: TabMessage): void {
    this.posted.push(message);
  }

  onMessage(handler: (message: unknown) => void): void {
    this.handlers.push(handler);
  }

  deliver(message: unknown): void {
    for (const handler of this.handlers) handler(message);
  }
}

/** Lets timers and promises run, so that a navigation that is waiting shows it is waiting. */
const yieldToTimers = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

describe.each(VARIANTS)('Exercise 42.3 variant %s', (variant) => {
  let controller: HttpTestingController;
  let router: Router;
  let session: Session;
  let channel = new FakeTabChannel();
  let navigate = vi.fn<(url: string) => void>();

  beforeEach(() => {
    channel = new FakeTabChannel();
    navigate = vi.fn<(url: string) => void>();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: '', pathMatch: 'full', children: [] },
          { path: 'login', canActivate: [leaveLoginWhenSignedIn], children: [] },
          { path: 'orders/:id', canMatch: [requireSession], children: [] },
        ]),
        provideHttpClient(withInterceptors([expireOn401])),
        provideHttpClientTesting(),
        { provide: TAB_CHANNEL, useValue: channel },
        { provide: LOGIN_NAVIGATION, useValue: navigate },
        PROVIDE_SESSION[variant](),
      ],
    });
    // The first inject builds the module and runs the initializers; the tick lets variant b's resource send.
    controller = TestBed.inject(HttpTestingController);
    TestBed.tick();
    router = TestBed.inject(Router);
    session = TestBed.inject(Session);
  });

  afterEach(() => {
    controller.verify();
  });

  /** Answers the startup check with 200, then the token request that follows it. */
  async function startSignedIn(): Promise<void> {
    controller.expectOne(ME_URL).flush(USER);
    const csrf: TestRequest = await vi.waitFor(() => controller.expectOne(CSRF_URL));
    csrf.flush(null, NO_CONTENT);
    await session.whenKnown();
  }

  async function startSignedOut(): Promise<void> {
    controller.expectOne(ME_URL).flush(null, UNAUTHORIZED);
    await session.whenKnown();
  }

  it('loads the session before the first route is matched', async () => {
    const statesAtMatch: SessionState[] = [];
    router.events.subscribe((event) => {
      if (event instanceof RoutesRecognized) statesAtMatch.push(session.state());
    });
    const me = controller.expectOne(ME_URL);

    const navigation = router.navigateByUrl('/orders/42');
    await yieldToTimers();
    expect(session.state()).toEqual({ status: 'unknown' });
    expect(statesAtMatch).toEqual([]);

    me.flush(USER);
    const csrf: TestRequest = await vi.waitFor(() => controller.expectOne(CSRF_URL));
    csrf.flush(null, NO_CONTENT);

    expect(await navigation).toBe(true);
    expect(router.url).toBe('/orders/42');
    expect(statesAtMatch).toEqual([SIGNED_IN]);
  });

  it('redirects a signed-out user to the login entry with the requested URL as `returnUrl`', async () => {
    await startSignedOut();

    await router.navigateByUrl('/orders/42?tab=notes');

    const landed = router.parseUrl(router.url);
    expect(router.url.split('?')[0]).toBe('/login');
    expect(landed.queryParams['returnUrl']).toBe('/orders/42?tab=notes');
    expect(navigate).not.toHaveBeenCalled();
    // The login page's button leaves the page for the BFF.
    session.startLogin();
    expect(navigate).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledWith(LOGIN_URL);
  });

  it('ignores a `returnUrl` that is not a same-origin path', async () => {
    await startSignedIn();

    for (const target of ['https://evil.example/steal', '//evil.example/x', 'javascript:alert(1)']) {
      await router.navigateByUrl(`/login?returnUrl=${encodeURIComponent(target)}`);
      expect(router.url).toBe('/');
    }
    await router.navigateByUrl(`/login?returnUrl=${encodeURIComponent('/orders/42')}`);
    expect(router.url).toBe('/orders/42');
  });

  it('turns several concurrent 401 responses into one login navigation', async () => {
    await startSignedIn();
    await router.navigateByUrl('/orders/42');
    const starts: string[] = [];
    router.events.subscribe((event) => {
      if (event instanceof NavigationStart) starts.push(event.url);
    });

    const http = TestBed.inject(HttpClient);
    const statuses: number[] = [];
    for (const path of ['/api/orders', '/api/profile', '/api/invoices']) {
      http.get(path).subscribe({ error: (error: HttpErrorResponse) => statuses.push(error.status) });
    }
    for (const pending of controller.match(() => true)) pending.flush(null, UNAUTHORIZED);

    await vi.waitFor(() => expect(router.url.split('?')[0]).toBe('/login'));
    expect(statuses).toEqual([401, 401, 401]);
    expect(starts).toHaveLength(1);
    expect(router.parseUrl(router.url).queryParams['returnUrl']).toBe('/orders/42');
    expect(session.state()).toEqual({ status: 'signed-out' });
  });

  it('fetches a fresh CSRF token after the session comes back', async () => {
    const me = controller.expectOne(ME_URL);
    await yieldToTimers();
    expect(controller.match(CSRF_URL)).toEqual([]);

    me.flush(USER);
    const csrf: TestRequest = await vi.waitFor(() => controller.expectOne(CSRF_URL));
    expect(csrf.request.method).toBe('GET');

    let known = false;
    void session.whenKnown().then(() => (known = true));
    await yieldToTimers();
    expect(known).toBe(false);
    csrf.flush(null, NO_CONTENT);
    await session.whenKnown();
    expect(session.state()).toEqual(SIGNED_IN);
  });

  it('clears the session when another tab posts a logout', async () => {
    await startSignedIn();

    channel.deliver({ type: 'session-extended' });
    expect(session.state()).toEqual(SIGNED_IN);

    channel.deliver(LOGGED_OUT);
    expect(session.state()).toEqual({ status: 'signed-out' });
    // The posting tab's POST /logout ended the server session; this tab sends nothing and echoes nothing.
    expect(channel.posted).toEqual([]);
  });
});
