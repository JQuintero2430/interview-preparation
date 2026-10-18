import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { authGuard } from './auth-guard';
import { authInterceptor } from './auth-interceptor';
import { AuthState } from './auth-state';
import { authRoutes } from './routes';

interface GuardRunner {
  /** Runs the guard for `url` and returns `'allowed'` or the URL it ended on. */
  run(url: string, token: string | null): Promise<string>;
}

const direct: GuardRunner = {
  async run(url, token) {
    TestBed.configureTestingModule({ providers: [provideRouter(authRoutes)] });
    if (token !== null) {
      TestBed.inject(AuthState).signIn(token);
    }
    const { snapshot } = TestBed.inject(Router).routerState;
    snapshot.url = url;
    const result = TestBed.runInInjectionContext(() => authGuard(snapshot.root, snapshot));
    return result === true ? 'allowed' : String(result);
  },
};

const throughRouter: GuardRunner = {
  async run(url, token) {
    TestBed.configureTestingModule({ providers: [provideRouter(authRoutes)] });
    if (token !== null) {
      TestBed.inject(AuthState).signIn(token);
    }
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url);
    const finalUrl = TestBed.inject(Router).url;
    return finalUrl === url ? 'allowed' : finalUrl;
  },
};

const runners: [string, GuardRunner][] = [
  ['direct', direct],
  ['through the router', throughRouter],
];

describe.each(runners)('E29.3 auth guard (%s)', (_name, runner) => {
  it('the guard lets a signed-in user through', async () => {
    expect(await runner.run('/account', 'abc')).toBe('allowed');
  });

  it('the guard redirects a signed-out user to login with the return URL', async () => {
    const result = await runner.run('/account', null);
    expect(decodeURIComponent(result)).toBe('/login?returnUrl=/account');
  });
});

describe('E29.3 auth interceptor', () => {
  function setup(token: string | null): { http: HttpClient; controller: HttpTestingController } {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    if (token !== null) {
      TestBed.inject(AuthState).signIn(token);
    }
    return { http: TestBed.inject(HttpClient), controller: TestBed.inject(HttpTestingController) };
  }

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('the interceptor adds the bearer token to API requests', () => {
    const { http, controller } = setup('abc');
    http.get('/api/orders').subscribe();
    const request = controller.expectOne('/api/orders');
    expect(request.request.headers.get('Authorization')).toBe('Bearer abc');
    request.flush([]);
  });

  it('the interceptor leaves other URLs untouched', () => {
    const { http, controller } = setup('abc');
    http.get('/assets/logo.svg').subscribe();
    const request = controller.expectOne('/assets/logo.svg');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush('');
  });

  it('a signed-out request carries no authorization header', () => {
    const { http, controller } = setup(null);
    http.get('/api/orders').subscribe();
    const request = controller.expectOne('/api/orders');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush([]);
  });

  it('no request is left unanswered', () => {
    const { http, controller } = setup('abc');
    http.get('/api/orders').subscribe();
    expect(() => controller.verify()).toThrow();
    controller.expectOne('/api/orders').flush([]);
    expect(() => controller.verify()).not.toThrow();
  });
});
