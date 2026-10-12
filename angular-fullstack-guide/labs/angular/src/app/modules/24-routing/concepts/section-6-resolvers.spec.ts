import { Component, inject, input, resource, Resource } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  CanActivateFn,
  NavigationCancel,
  NavigationCancellationCode,
  NavigationEnd,
  NavigationError,
  NavigationSkipped,
  NavigationSkippedCode,
  NavigationStart,
  RedirectCommand,
  ResolveFn,
  Router,
  Routes,
  nonBlocking,
  provideRouter,
  withComponentInputBinding,
  withNavigationErrorHandler,
  withRouterConfig,
  withRouterResources,
} from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { BehaviorSubject, EMPTY, of, throwError } from 'rxjs';
import { legacyMappedResolver } from '../legacy/deprecated-forms';

@Component({ selector: 'lab-m24-resolver-page', template: 'page' })
class LabM24ResolverPage {}

@Component({ selector: 'lab-m24-resolver-login', template: 'login' })
class LabM24ResolverLogin {}

/** A routed component whose input is bound from a blocking router resource: the value. */
@Component({ selector: 'lab-m24-resolver-user', template: '{{ user() }}' })
class LabM24ResolverUser {
  readonly user = input<string>();
}

/** A routed component whose input is bound from a `nonBlocking` router resource: the whole `Resource`. */
@Component({ selector: 'lab-m24-resolver-report', template: 'report' })
class LabM24ResolverReport {
  readonly report = input.required<Resource<string>>();
}

/** The navigation events of this section, as `start`, `end`, `error` or `cancel:<code>`. */
function kinds(events: unknown[]): string[] {
  return events.flatMap((e) => {
    if (e instanceof NavigationStart) return ['start'];
    if (e instanceof NavigationEnd) return ['end'];
    if (e instanceof NavigationError) return ['error'];
    if (e instanceof NavigationSkipped) return [`skipped:${e.code}`];
    if (e instanceof NavigationCancel) return [`cancel:${e.code}`];
    return [];
  });
}

async function create(routes: Routes, ...features: Parameters<typeof provideRouter>[1][]) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [provideRouter(routes, ...features)] });
  const harness = await RouterTestingHarness.create();
  const router = TestBed.inject(Router);
  const events: unknown[] = [];
  router.events.subscribe((e) => events.push(e));
  return { harness, router, events };
}

/** A promise that the test settles by hand. */
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
}

describe('Section 6: resolvers and route data', () => {
  it("Section 6: a resolver's first value lands in route data", async () => {
    const open = new BehaviorSubject('first');
    const { router } = await create([
      { path: 'many', resolve: { x: () => of(1, 2, 3) }, component: LabM24ResolverPage },
      { path: 'open', resolve: { x: () => open }, component: LabM24ResolverPage },
    ]);
    expect(await router.navigateByUrl('/many')).toBe(true);
    expect(router.routerState.snapshot.root.firstChild?.data).toEqual({ x: 1 });
    // `open` never completes; the navigation still ends with its first value, and the router unsubscribed.
    expect(await router.navigateByUrl('/open')).toBe(true);
    expect(router.routerState.snapshot.root.firstChild?.data).toEqual({ x: 'first' });
    expect(open.observed).toBe(false);
  });

  it('Section 6: a resolver that completes empty cancels with NoDataFromResolver', async () => {
    const { harness, router, events } = await create([
      { path: '', component: LabM24ResolverPage },
      { path: 'empty', resolve: { x: () => EMPTY }, component: LabM24ResolverPage },
    ]);
    await harness.navigateByUrl('/');
    events.length = 0;
    expect(await router.navigateByUrl('/empty')).toBe(false);
    expect(router.url).toBe('/');
    expect(kinds(events)).toEqual(['start', `cancel:${NavigationCancellationCode.NoDataFromResolver}`]);
    expect(NavigationCancellationCode.NoDataFromResolver).toBe(2);
  });

  it('Section 6: a resolver error rejects the navigation with NavigationError', async () => {
    const { harness, router, events } = await create([
      { path: '', component: LabM24ResolverPage },
      { path: 'boom', resolve: { x: () => throwError(() => new Error('boom')) }, component: LabM24ResolverPage },
    ]);
    await harness.navigateByUrl('/');
    events.length = 0;
    await expect(router.navigateByUrl('/boom')).rejects.toThrow('boom');
    expect(router.url).toBe('/');
    expect(kinds(events)).toEqual(['start', 'error']);
  });

  it('Section 6: withNavigationErrorHandler turns the error into a redirect', async () => {
    const { harness, router, events } = await create(
      [
        { path: '', component: LabM24ResolverPage },
        { path: 'error', component: LabM24ResolverLogin },
        { path: 'boom', resolve: { x: () => throwError(() => new Error('boom')) }, component: LabM24ResolverPage },
      ],
      withNavigationErrorHandler(() => new RedirectCommand(inject(Router).parseUrl('/error'))),
    );
    await harness.navigateByUrl('/');
    events.length = 0;
    expect(await router.navigateByUrl('/boom')).toBe(true);
    expect(router.url).toBe('/error');
    expect(kinds(events)).toEqual(['start', `cancel:${NavigationCancellationCode.Redirect}`, 'start', 'end']);
  });

  it('Section 6: a resolver can redirect with RedirectCommand', async () => {
    const toLogin: ResolveFn<string> = () => new RedirectCommand(inject(Router).parseUrl('/login'));
    const { harness, router, events } = await create([
      { path: '', component: LabM24ResolverPage },
      { path: 'login', component: LabM24ResolverLogin },
      { path: 'needs-login', resolve: { x: toLogin }, component: LabM24ResolverPage },
    ]);
    await harness.navigateByUrl('/');
    events.length = 0;
    expect(await router.navigateByUrl('/needs-login')).toBe(true);
    expect(router.url).toBe('/login');
    expect(kinds(events)).toEqual(['start', `cancel:${NavigationCancellationCode.Redirect}`, 'start', 'end']);
  });

  it('Section 6: runGuardsAndResolvers always with onSameUrlNavigation reload reruns the guard', async () => {
    let guardCalls = 0;
    let resolverCalls = 0;
    const guard: CanActivateFn = () => ++guardCalls > 0;
    const { router } = await create(
      [
        {
          path: 'r',
          runGuardsAndResolvers: 'always',
          canActivate: [guard],
          resolve: { n: () => ++resolverCalls },
          component: LabM24ResolverPage,
        },
      ],
      withRouterConfig({ onSameUrlNavigation: 'reload' }),
    );
    expect(await router.navigateByUrl('/r')).toBe(true);
    expect(await router.navigateByUrl('/r')).toBe(true);
    expect(guardCalls).toBe(2);
    expect(resolverCalls).toBe(2);
  });

  it('Section 6: a query-only change does not rerun guards by default', async () => {
    let guardCalls = 0;
    let resolverCalls = 0;
    const guard: CanActivateFn = () => ++guardCalls > 0;
    const { router } = await create([
      { path: 'p', canActivate: [guard], resolve: { n: () => ++resolverCalls }, component: LabM24ResolverPage },
      { path: 'q/:id', canActivate: [guard], resolve: { n: () => ++resolverCalls }, component: LabM24ResolverPage },
    ]);
    await router.navigateByUrl('/p?x=1');
    await router.navigateByUrl('/p?x=2');
    expect(router.url).toBe('/p?x=2');
    expect(guardCalls).toBe(1);
    expect(resolverCalls).toBe(1);
    // A path parameter change is a `paramsChange`: both run again.
    await router.navigateByUrl('/q/1');
    await router.navigateByUrl('/q/2');
    expect(guardCalls).toBe(3);
    expect(resolverCalls).toBe(3);
  });

  it('Section 6: a same-URL navigation is skipped by default', async () => {
    const { harness, router, events } = await create([{ path: 'fast', component: LabM24ResolverPage }]);
    await harness.navigateByUrl('/fast');
    events.length = 0;
    expect(await router.navigateByUrl('/fast')).toBe(false);
    expect(kinds(events)).toEqual([`skipped:${NavigationSkippedCode.IgnoredSameUrlNavigation}`]);
  });

  it('Section 6: a blocking router resource is resolved when the navigation ends', async () => {
    let loaderCalls = 0;
    const { harness, router } = await create(
      [
        {
          path: 'u/:id',
          component: LabM24ResolverUser,
          resources: ({ params }) => ({
            user: resource({
              params: () => params()['id'],
              loader: async ({ params: id }) => {
                loaderCalls++;
                return 'user-' + id;
              },
            }),
          }),
        },
      ],
      withComponentInputBinding(),
      withRouterResources(),
    );
    const page = await harness.navigateByUrl('/u/3', LabM24ResolverUser);
    expect(loaderCalls).toBe(1);
    const resources = router.routerState.root.firstChild?.snapshot.resources;
    expect(Object.keys(resources ?? {})).toEqual(['user']);
    expect(resources?.['user'].status()).toBe('resolved');
    expect(resources?.['user'].value()).toBe('user-3');
    // A blocking resource binds its value, not the `Resource`.
    expect(page.user()).toBe('user-3');
  });

  it('Section 6: a nonBlocking resource activates the route before it resolves', async () => {
    const gate = deferred<string>();
    const { harness, router, events } = await create(
      [
        {
          path: 'slow',
          component: LabM24ResolverReport,
          resources: () => ({ report: nonBlocking(resource({ loader: () => gate.promise })) }),
        },
      ],
      withComponentInputBinding(),
      withRouterResources(),
    );
    const page = await harness.navigateByUrl('/slow', LabM24ResolverReport);
    expect(router.url).toBe('/slow');
    expect(kinds(events)).toEqual(['start', 'end']);
    // The input holds the whole `Resource`, still loading.
    expect(page.report().isLoading()).toBe(true);
    expect(page.report().value()).toBeUndefined();
    gate.resolve('done');
    await harness.fixture.whenStable();
    expect(page.report().isLoading()).toBe(false);
    expect(page.report().value()).toBe('done');
  });

  it('Section 6: a failing blocking router resource fails the navigation and a nonBlocking one does not', async () => {
    const { harness, router, events } = await create(
      [
        { path: '', component: LabM24ResolverPage },
        {
          path: 'blocking',
          component: LabM24ResolverUser,
          resources: () => ({
            user: resource({
              loader: async () => {
                throw new Error('down');
              },
            }),
          }),
        },
        {
          path: 'non-blocking',
          component: LabM24ResolverReport,
          resources: () => ({
            report: nonBlocking(
              resource({
                loader: async () => {
                  throw new Error('down');
                },
              }),
            ),
          }),
        },
      ],
      withComponentInputBinding(),
      withRouterResources(),
    );
    await harness.navigateByUrl('/');
    events.length = 0;
    await expect(router.navigateByUrl('/blocking')).rejects.toThrow('down');
    expect(router.url).toBe('/');
    expect(kinds(events)).toEqual(['start', 'error']);

    events.length = 0;
    const page = await harness.navigateByUrl('/non-blocking', LabM24ResolverReport);
    await harness.fixture.whenStable();
    expect(router.url).toBe('/non-blocking');
    expect(kinds(events)).toEqual(['start', 'end']);
    expect(page.report().status()).toBe('error');
  });

  describe('Legacy', () => {
    it('Section 6: a class resolver works through mapToResolve', async () => {
      const { router } = await create([
        { path: 'products/:id', resolve: { name: legacyMappedResolver }, component: LabM24ResolverPage },
        {
          path: 'functions/:id',
          resolve: { name: ((route) => `product-${route.paramMap.get('id')}`) satisfies ResolveFn<string> },
          component: LabM24ResolverPage,
        },
      ]);
      await router.navigateByUrl('/products/7');
      expect(router.routerState.snapshot.root.firstChild?.data).toEqual({ name: 'product-7' });
      await router.navigateByUrl('/functions/7');
      expect(router.routerState.snapshot.root.firstChild?.data).toEqual({ name: 'product-7' });
    });
  });
});
