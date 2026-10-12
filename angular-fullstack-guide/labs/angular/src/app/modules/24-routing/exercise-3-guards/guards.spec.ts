import { TestBed } from '@angular/core/testing';
import {
  NavigationEnd,
  RedirectCommand,
  Router,
  provideRouter,
  type Routes,
} from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { guardedRoutes, type LabM24LoaderCounter } from './app.routes';
import { LabM24Editor } from './editor';
import { hasRoleFromData, requireLogin } from './guards';
import { legacyLoginGuards } from './legacy/class-guard';
import { LAB_M24_CONFIRM, LabM24Role, LabM24Session } from './session';

/** The solution's `canMatch` and the alternative, one guard reading `route.data`. */
const ADMIN_TABLES: ((counter: LabM24LoaderCounter) => Routes)[] = [
  guardedRoutes,
  (counter) =>
    guardedRoutes(counter).map((route) =>
      route.path === 'admin' ? { ...route, canMatch: [hasRoleFromData], data: { role: 'admin' } } : route,
    ),
];

/** The solution's `checkout` guard and the legacy class guard, converted by `mapToCanActivate`. */
const CHECKOUT_TABLES: ((counter: LabM24LoaderCounter) => Routes)[] = [
  guardedRoutes,
  (counter) =>
    guardedRoutes(counter).map((route) =>
      route.path === 'checkout' ? { ...route, canActivate: legacyLoginGuards } : route,
    ),
];

/** Starts a fresh router with a session in the given role and a replaceable confirm function. */
async function start(
  routes: Routes,
  role: LabM24Role,
  confirm: (message: string) => boolean = () => true,
) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [provideRouter(routes), { provide: LAB_M24_CONFIRM, useValue: confirm }],
  });
  TestBed.inject(LabM24Session).role.set(role);
  return RouterTestingHarness.create();
}

describe('E24.3 guard an admin area and an editor', () => {
  it('a non-admin navigating to `/admin` never runs the admin loader and lands on the not-found page', async () => {
    for (const table of ADMIN_TABLES) {
      for (const role of ['guest', 'user'] as const) {
        const counter = { calls: 0 };
        const harness = await start(table(counter), role);
        await harness.navigateByUrl('/admin');
        expect(counter.calls).toBe(0);
        expect(TestBed.inject(Router).url).toBe('/admin');
        expect(harness.routeNativeElement?.textContent).toContain('not-found');
      }
    }
  });

  it('an admin loads the admin area once, however many times it is visited', async () => {
    for (const table of ADMIN_TABLES) {
      const counter = { calls: 0 };
      const harness = await start(table(counter), 'admin');
      await harness.navigateByUrl('/admin');
      expect(harness.routeNativeElement?.textContent).toContain('admin area');
      await harness.navigateByUrl('/');
      await harness.navigateByUrl('/admin');
      await harness.navigateByUrl('/admin');
      expect(counter.calls).toBe(1);
    }
  });

  it('a logged-out user opening `/checkout` is redirected to `/login?returnUrl=%2Fcheckout` with a `RedirectCommand`', async () => {
    const harness = await start(guardedRoutes({ calls: 0 }), 'guest');
    const router = TestBed.inject(Router);
    const ends: string[] = [];
    router.events.subscribe((e) => e instanceof NavigationEnd && ends.push(e.urlAfterRedirects));
    expect(await router.navigateByUrl('/checkout')).toBe(true);
    expect(router.url).toBe('/login?returnUrl=%2Fcheckout');
    expect(ends).toEqual(['/login?returnUrl=%2Fcheckout']);
    expect(harness.routeNativeElement?.textContent).toContain('login');

    const result = TestBed.runInInjectionContext(() =>
      requireLogin({} as never, { url: '/checkout' } as never),
    );
    expect(result).toBeInstanceOf(RedirectCommand);
  });

  it('leaving the editor with unsaved changes asks the injected confirm function and stays when it answers no', async () => {
    const confirm = vi.fn(() => false);
    const harness = await start(guardedRoutes({ calls: 0 }), 'user', confirm);
    const router = TestBed.inject(Router);
    const editor = await harness.navigateByUrl('/editor', LabM24Editor);
    editor.text.set('draft');
    expect(await router.navigateByUrl('/')).toBe(false);
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(router.url).toBe('/editor');

    confirm.mockReturnValue(true);
    expect(await router.navigateByUrl('/')).toBe(true);
    expect(confirm).toHaveBeenCalledTimes(2);
    expect(router.url).toBe('/');
  });

  it('leaving the editor without changes does not ask', async () => {
    const confirm = vi.fn(() => false);
    const harness = await start(guardedRoutes({ calls: 0 }), 'user', confirm);
    const router = TestBed.inject(Router);
    await harness.navigateByUrl('/editor', LabM24Editor);
    expect(await router.navigateByUrl('/')).toBe(true);
    expect(confirm).not.toHaveBeenCalled();

    const editor = await harness.navigateByUrl('/editor', LabM24Editor);
    editor.text.set('draft');
    editor.save();
    expect(await router.navigateByUrl('/')).toBe(true);
    expect(confirm).not.toHaveBeenCalled();
  });

  it('the legacy class guard and the functional `requireLogin` give the same results for the same session states', async () => {
    const outcomes: unknown[][] = [];
    for (const table of CHECKOUT_TABLES) {
      const results: unknown[] = [];
      for (const role of ['guest', 'user', 'admin'] as const) {
        const harness = await start(table({ calls: 0 }), role);
        const router = TestBed.inject(Router);
        await harness.navigateByUrl('/');
        results.push([await router.navigateByUrl('/checkout'), router.url]);
      }
      outcomes.push(results);
    }
    expect(outcomes[0]).toEqual([
      [true, '/login?returnUrl=%2Fcheckout'],
      [true, '/checkout'],
      [true, '/checkout'],
    ]);
    expect(outcomes[1]).toEqual(outcomes[0]);
  });
});
