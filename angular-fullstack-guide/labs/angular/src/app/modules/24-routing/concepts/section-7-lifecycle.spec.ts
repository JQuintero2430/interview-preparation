import { Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  CanActivateFn,
  Event,
  NavigationCancel,
  NavigationCancellationCode,
  NavigationEnd,
  NavigationError,
  NavigationSkipped,
  NavigationSkippedCode,
  NavigationStart,
  Router,
  RouterOutlet,
  Routes,
  isActive,
  provideRouter,
} from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { EMPTY, map, throwError, timer } from 'rxjs';
import { legacyCurrentNavigationUrl, legacyIsActiveSnapshot } from '../legacy/deprecated-forms';

@Component({ selector: 'lab-m24-lifecycle-page', template: 'page' })
class LabM24LifecyclePage {}

@Component({ selector: 'lab-m24-lifecycle-shell', imports: [RouterOutlet], template: '<router-outlet />' })
class LabM24LifecycleShell {}

/** A promise that the test settles by hand. */
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
}

/** The router events by class name. */
function names(events: Event[]): string[] {
  return events.map((e) => e.constructor.name);
}

/** The terminal events of `events` as `end`, `error`, `skipped:<code>` or `cancel:<code>`, with the navigation id. */
function terminals(events: Event[]): { id: number; kind: string }[] {
  return events.flatMap((e) => {
    if (e instanceof NavigationEnd) return [{ id: e.id, kind: 'end' }];
    if (e instanceof NavigationError) return [{ id: e.id, kind: 'error' }];
    if (e instanceof NavigationSkipped) return [{ id: e.id, kind: `skipped:${e.code}` }];
    if (e instanceof NavigationCancel) return [{ id: e.id, kind: `cancel:${e.code}` }];
    return [];
  });
}

async function create(routes: Routes) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
  const harness = await RouterTestingHarness.create();
  const router = TestBed.inject(Router);
  const events: Event[] = [];
  router.events.subscribe((e) => events.push(e));
  return { harness, router, events };
}

const nested: Routes = [
  { path: 'admin', component: LabM24LifecycleShell, children: [{ path: ':id', component: LabM24LifecyclePage }] },
];

const slowGuard: CanActivateFn = () => timer(50).pipe(map(() => true));

describe('Section 7: the navigation lifecycle', () => {
  it('Section 7: a successful navigation emits the events in this order', async () => {
    const { router, events } = await create(nested);

    await router.navigateByUrl('/admin/3');

    expect(names(events)).toEqual([
      'NavigationStart',
      'RoutesRecognized',
      'GuardsCheckStart',
      'ChildActivationStart',
      'ActivationStart',
      'ChildActivationStart',
      'ActivationStart',
      'GuardsCheckEnd',
      'ResolveStart',
      'ResolveEnd',
      'ActivationEnd',
      'ChildActivationEnd',
      'ActivationEnd',
      'ChildActivationEnd',
      'NavigationEnd',
    ]);
  });

  it('Section 7: a loadChildren route adds RouteConfigLoadStart and RouteConfigLoadEnd before RoutesRecognized', async () => {
    const { router, events } = await create([
      { path: 'lazy', loadChildren: () => [{ path: '', component: LabM24LifecyclePage }] },
    ]);

    await router.navigateByUrl('/lazy');

    expect(names(events).slice(0, 4)).toEqual([
      'NavigationStart',
      'RouteConfigLoadStart',
      'RouteConfigLoadEnd',
      'RoutesRecognized',
    ]);
    expect(names(events)).toHaveLength(17);
    expect(names(events).at(-1)).toBe('NavigationEnd');
  });

  it('Section 7: a loadComponent route emits RouteConfigLoadStart and RouteConfigLoadEnd after ResolveEnd', async () => {
    const { router, events } = await create([{ path: 'lazy', loadComponent: () => LabM24LifecyclePage }]);

    await router.navigateByUrl('/lazy');

    const list = names(events);
    expect(list.indexOf('RouteConfigLoadStart')).toBe(list.indexOf('ResolveEnd') + 1);
    expect(list.indexOf('RouteConfigLoadEnd')).toBe(list.indexOf('RouteConfigLoadStart') + 1);
    expect(list.at(-1)).toBe('NavigationEnd');
  });

  it('Section 7: a second navigation supersedes the first with code SupersededByNewNavigation', async () => {
    const { router, events } = await create([
      { path: 'slow', canActivate: [slowGuard], component: LabM24LifecyclePage },
      { path: 'fast', component: LabM24LifecyclePage },
    ]);

    const results = await Promise.all([router.navigateByUrl('/slow'), router.navigateByUrl('/fast')]);

    expect(results).toEqual([false, true]);
    expect(router.url).toBe('/fast');
    const cancel = events.find((e) => e instanceof NavigationCancel) as NavigationCancel;
    expect(cancel.code).toBe(NavigationCancellationCode.SupersededByNewNavigation);
    expect(cancel.reason).toBe('Navigation ID 1 is not equal to the current navigation id 2');
    expect(terminals(events)).toEqual([
      { id: 1, kind: 'cancel:1' },
      { id: 2, kind: 'end' },
    ]);
  });

  it('Section 7: abort cancels the current navigation with code Aborted', async () => {
    const gate = deferred<boolean>();
    const { router, events } = await create([
      { path: 'slow', canActivate: [() => gate.promise], component: LabM24LifecyclePage },
    ]);

    const result = router.navigateByUrl('/slow');
    router.currentNavigation()?.abort();

    expect(await result).toBe(false);
    expect(router.url).toBe('/');
    const cancel = events.find((e) => e instanceof NavigationCancel) as NavigationCancel;
    expect(cancel.code).toBe(NavigationCancellationCode.Aborted);
    expect(cancel.reason).toContain('AbortError');
    expect(names(events)).toEqual(['NavigationStart', 'NavigationCancel']);
    gate.resolve(true);
  });

  it('Section 7: currentNavigation is the running navigation and null afterwards', async () => {
    const gate = deferred<boolean>();
    const { router } = await create([
      { path: 'slow', canActivate: [() => gate.promise], component: LabM24LifecyclePage },
    ]);
    expect(router.currentNavigation()).toBeNull();

    const result = router.navigateByUrl('/slow');

    expect(router.currentNavigation()?.extractedUrl.toString()).toBe('/slow');
    expect(router.currentNavigation()?.trigger).toBe('imperative');
    gate.resolve(true);
    await result;
    expect(router.currentNavigation()).toBeNull();
  });

  it('Section 7: lastSuccessfulNavigation holds the last completed URL', async () => {
    const { router } = await create([
      { path: 'a', component: LabM24LifecyclePage },
      { path: 'b', component: LabM24LifecyclePage },
      { path: 'blocked', canActivate: [() => false], component: LabM24LifecyclePage },
    ]);
    expect(router.lastSuccessfulNavigation()).toBeNull();

    await router.navigateByUrl('/a');
    await router.navigateByUrl('/b');
    await router.navigateByUrl('/blocked');

    expect(router.lastSuccessfulNavigation()?.finalUrl?.toString()).toBe('/b');
  });

  it('Section 7: a same-URL navigation is skipped with IgnoredSameUrlNavigation', async () => {
    const { router, events } = await create([{ path: 'fast', component: LabM24LifecyclePage }]);
    await router.navigateByUrl('/fast');
    events.length = 0;

    const result = await router.navigateByUrl('/fast');

    expect(result).toBe(false);
    expect(names(events)).toEqual(['NavigationSkipped']);
    expect((events[0] as NavigationSkipped).code).toBe(NavigationSkippedCode.IgnoredSameUrlNavigation);
  });

  it('Section 7: isActive is a signal that follows the URL', async () => {
    const { router } = await create([
      { path: 'admin', component: LabM24LifecycleShell, children: [{ path: ':id', component: LabM24LifecyclePage }] },
      { path: 'other', component: LabM24LifecyclePage },
    ]);
    const admin = TestBed.runInInjectionContext(() => isActive('/admin', router));
    const exact = TestBed.runInInjectionContext(() => isActive('/admin', router, { paths: 'exact' }));
    expect(admin()).toBe(false);

    await router.navigateByUrl('/admin/3');
    expect([admin(), exact()]).toEqual([true, false]);

    await router.navigateByUrl('/other');
    expect([admin(), exact()]).toEqual([false, false]);
  });

  it('Section 7: the cancellation codes have the values of the table', () => {
    expect(NavigationCancellationCode.Redirect).toBe(0);
    expect(NavigationCancellationCode.SupersededByNewNavigation).toBe(1);
    expect(NavigationCancellationCode.NoDataFromResolver).toBe(2);
    expect(NavigationCancellationCode.GuardRejected).toBe(3);
    expect(NavigationCancellationCode.Aborted).toBe(4);
    expect(NavigationSkippedCode.IgnoredSameUrlNavigation).toBe(0);
    expect(NavigationSkippedCode.IgnoredByUrlHandlingStrategy).toBe(1);
  });

  it('Section 7: a rejecting guard, a UrlTree guard and an empty resolver cancel with their codes and resolve', async () => {
    const { router, events } = await create([
      { path: 'denied', canActivate: [() => false], component: LabM24LifecyclePage },
      { path: 'to-login', canActivate: [() => inject(Router).parseUrl('/login')], component: LabM24LifecyclePage },
      { path: 'empty', resolve: { x: () => EMPTY }, component: LabM24LifecyclePage },
      { path: 'login', component: LabM24LifecyclePage },
    ]);

    const results = [
      await router.navigateByUrl('/denied'),
      await router.navigateByUrl('/to-login'),
      await router.navigateByUrl('/empty'),
    ];

    expect(results).toEqual([false, true, false]);
    expect(terminals(events)).toEqual([
      { id: 1, kind: 'cancel:3' },
      { id: 2, kind: 'cancel:0' },
      { id: 3, kind: 'end' },
      { id: 4, kind: 'cancel:2' },
    ]);
    expect(router.url).toBe('/login');
  });

  it('Section 7: each navigation id ends with exactly one terminal event', async () => {
    const { router, events } = await create([
      { path: 'ok', component: LabM24LifecyclePage },
      { path: 'denied', canActivate: [() => false], component: LabM24LifecyclePage },
      { path: 'boom', resolve: { x: () => throwError(() => new Error('boom')) }, component: LabM24LifecyclePage },
      { path: 'slow', canActivate: [slowGuard], component: LabM24LifecyclePage },
      { path: 'other', component: LabM24LifecyclePage },
    ]);

    await router.navigateByUrl('/ok');
    await router.navigateByUrl('/denied');
    await router.navigateByUrl('/boom').then(
      () => 'resolved',
      (e: Error) => e.message,
    );
    await Promise.all([router.navigateByUrl('/slow'), router.navigateByUrl('/other')]);
    await router.navigateByUrl('/other');

    const started = events.filter((e) => e instanceof NavigationStart).map((e) => (e as NavigationStart).id);
    const ended = terminals(events);
    expect(ended.map((t) => t.id)).toEqual([...started, 6]);
    expect(ended.map((t) => t.kind)).toEqual(['end', 'cancel:3', 'error', 'cancel:1', 'end', 'skipped:0']);
  });

  it('Section 7: a cancelled navigation resolves false and only an error rejects', async () => {
    const { router } = await create([
      { path: 'denied', canActivate: [() => false], component: LabM24LifecyclePage },
      { path: 'boom', resolve: { x: () => throwError(() => new Error('boom')) }, component: LabM24LifecyclePage },
    ]);

    const cancelled = await router.navigateByUrl('/denied');
    const failure = await router.navigateByUrl('/boom').catch((e: Error) => e.message);

    expect(cancelled).toBe(false);
    expect(failure).toBe('boom');
  });
});

describe('Section 7: legacy forms', () => {
  it('Section 7: getCurrentNavigation still returns the running navigation', async () => {
    const gate = deferred<boolean>();
    const { router } = await create([
      { path: 'slow', canActivate: [() => gate.promise], component: LabM24LifecyclePage },
    ]);

    const result = router.navigateByUrl('/slow');

    expect(legacyCurrentNavigationUrl(router)).toBe('/slow');
    gate.resolve(true);
    await result;
    expect(legacyCurrentNavigationUrl(router)).toBeNull();
  });

  it('Section 7: Router.isActive with match options returns a boolean that does not follow the URL', async () => {
    const { router } = await create([
      { path: 'a', component: LabM24LifecyclePage },
      { path: 'b', component: LabM24LifecyclePage },
    ]);
    await router.navigateByUrl('/a');

    const snapshot = legacyIsActiveSnapshot(router, '/a');
    await router.navigateByUrl('/b');

    expect(snapshot).toBe(true);
    expect(legacyIsActiveSnapshot(router, '/a')).toBe(false);
  });

  it('Section 7: reading lastSuccessfulNavigation without calling it gives undefined, not a Navigation', async () => {
    const { router } = await create([{ path: 'a', component: LabM24LifecyclePage }]);
    await router.navigateByUrl('/a');

    // @ts-expect-error since v21 the property is a Signal, so `.finalUrl` is not a member of it
    const stale = router.lastSuccessfulNavigation?.finalUrl;

    expect(stale).toBeUndefined();
    expect(router.lastSuccessfulNavigation()?.finalUrl?.toString()).toBe('/a');
  });
});
