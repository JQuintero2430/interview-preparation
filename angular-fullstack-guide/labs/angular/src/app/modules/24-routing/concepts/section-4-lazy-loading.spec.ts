import { Component, OnDestroy, Injectable, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  CanMatchFn,
  GuardsCheckEnd,
  NavigationEnd,
  ResolveEnd,
  RouteConfigLoadEnd,
  RouteConfigLoadStart,
  RoutesRecognized,
  Router,
  Routes,
  provideRouter,
  withAutoCleanupInjectors,
} from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

@Component({ selector: 'lab-m24-home', template: 'home' })
class LabM24Home {}

@Component({ selector: 'lab-m24-lazy-page', template: 'lazy' })
class LabM24LazyPage {}

@Component({ selector: 'lab-m24-not-found', template: 'not-found' })
class LabM24NotFound {}

/** A route-level service that counts how many instances were built and destroyed. */
@Injectable()
class LabM24RouteService implements OnDestroy {
  static built = 0;
  static destroyed = 0;

  constructor() {
    LabM24RouteService.built++;
  }

  ngOnDestroy(): void {
    LabM24RouteService.destroyed++;
  }
}

@Component({ selector: 'lab-m24-uses-service', template: 'feature' })
class LabM24UsesService {
  protected readonly service = inject(LabM24RouteService);
}

const deny: CanMatchFn = () => false;
const allow: CanMatchFn = () => true;

/** A `loadChildren` loader that counts its calls and returns a one-route array. */
function countingChildren(counter: { calls: number }): () => Promise<Routes> {
  return async () => {
    counter.calls++;
    return [{ path: '', component: LabM24LazyPage }];
  };
}

async function create(routes: Routes, ...features: Parameters<typeof provideRouter>[1][]) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [provideRouter(routes, ...features)] });
  const harness = await RouterTestingHarness.create();
  const events: unknown[] = [];
  TestBed.inject(Router).events.subscribe((e) => events.push(e));
  return { harness, events, router: TestBed.inject(Router) };
}

describe('Section 4: lazy loading in depth', () => {
  beforeEach(() => {
    LabM24RouteService.built = 0;
    LabM24RouteService.destroyed = 0;
  });

  it('Section 4: the loader runs once, on the first navigation that needs it', async () => {
    const counter = { calls: 0 };
    const { harness } = await create([
      { path: '', component: LabM24Home },
      { path: 'lazy', loadChildren: countingChildren(counter) },
    ]);
    expect(counter.calls).toBe(0);
    await harness.navigateByUrl('/lazy');
    expect(counter.calls).toBe(1);
    await harness.navigateByUrl('/');
    await harness.navigateByUrl('/lazy');
    expect(counter.calls).toBe(1);
  });

  it('Section 4: a rejecting canMatch prevents the load and falls through', async () => {
    const counter = { calls: 0 };
    const routes: Routes = [
      { path: '', component: LabM24Home },
      { path: 'admin', canMatch: [deny], loadChildren: countingChildren(counter) },
      { path: '**', component: LabM24NotFound },
    ];
    const { harness, events, router } = await create(routes);
    await harness.navigateByUrl('/admin');
    expect(counter.calls).toBe(0);
    expect(router.url).toBe('/admin');
    expect(harness.routeNativeElement?.textContent).toContain('not-found');
    expect(events.some((e) => e instanceof RouteConfigLoadStart)).toBe(false);

    const allowed = await create([
      { path: '', component: LabM24Home },
      { path: 'admin', canMatch: [allow], loadChildren: countingChildren(counter) },
    ]);
    await allowed.harness.navigateByUrl('/admin');
    expect(counter.calls).toBe(1);
  });

  it('Section 4: a lazy navigation emits RouteConfigLoadStart and RouteConfigLoadEnd', async () => {
    const counter = { calls: 0 };
    const { harness, events, router } = await create([
      { path: '', component: LabM24Home },
      { path: 'lazy', loadChildren: countingChildren(counter) },
    ]);
    await harness.navigateByUrl('/lazy');
    const start = events.findIndex((e) => e instanceof RouteConfigLoadStart);
    const end = events.findIndex((e) => e instanceof RouteConfigLoadEnd);
    const recognized = events.findIndex((e) => e instanceof RoutesRecognized);
    expect(start).toBeGreaterThan(-1);
    expect(start).toBeLessThan(end);
    expect(end).toBeLessThan(recognized);
    expect((events[start] as RouteConfigLoadStart).route.path).toBe('lazy');
    expect(router.url).toBe('/lazy');

    events.length = 0;
    await harness.navigateByUrl('/');
    await harness.navigateByUrl('/lazy');
    expect(events.some((e) => e instanceof RouteConfigLoadStart)).toBe(false);
  });

  it('Section 4: a failing canActivate does not stop a loadChildren loader', async () => {
    const counter = { calls: 0 };
    const { harness, router } = await create([
      { path: '', component: LabM24Home },
      { path: 'admin', canActivate: [() => false], loadChildren: countingChildren(counter) },
    ]);
    await harness.navigateByUrl('/');
    await router.navigateByUrl('/admin');
    expect(counter.calls).toBe(1);
    expect(router.url).toBe('/');
  });

  it('Section 4: a failing canActivate stops a loadComponent loader', async () => {
    const calls = { loader: 0 };
    const { harness, router } = await create([
      { path: '', component: LabM24Home },
      {
        path: 'admin',
        canActivate: [() => false],
        loadComponent: async () => {
          calls.loader++;
          return LabM24LazyPage;
        },
      },
    ]);
    await harness.navigateByUrl('/');
    await router.navigateByUrl('/admin');
    expect(calls.loader).toBe(0);
    expect(router.url).toBe('/');
  });

  it('Section 4: a loadComponent loader runs after the guards and the resolvers', async () => {
    const calls = { loader: 0 };
    const { harness, events } = await create([
      { path: '', component: LabM24Home },
      {
        path: 'page',
        loadComponent: async () => {
          calls.loader++;
          return LabM24LazyPage;
        },
      },
    ]);
    await harness.navigateByUrl('/page');
    expect(calls.loader).toBe(1);
    const resolveEnd = events.findIndex((e) => e instanceof ResolveEnd);
    const guardsEnd = events.findIndex((e) => e instanceof GuardsCheckEnd);
    const start = events.findIndex((e) => e instanceof RouteConfigLoadStart);
    const end = events.findIndex((e) => e instanceof RouteConfigLoadEnd);
    const navEnd = events.findIndex((e) => e instanceof NavigationEnd);
    expect(guardsEnd).toBeLessThan(resolveEnd);
    expect(resolveEnd).toBeLessThan(start);
    expect(start).toBeLessThan(end);
    expect(end).toBeLessThan(navEnd);
  });

  it('Section 4: a route injector outlives the route by default', async () => {
    const routes: Routes = [
      { path: '', component: LabM24Home },
      { path: 'f', providers: [LabM24RouteService], component: LabM24UsesService },
    ];
    const { harness } = await create(routes);
    await harness.navigateByUrl('/f');
    await harness.navigateByUrl('/');
    expect(LabM24RouteService.built).toBe(1);
    expect(LabM24RouteService.destroyed).toBe(0);
    await harness.navigateByUrl('/f');
    expect(LabM24RouteService.built).toBe(1);
    expect(LabM24RouteService.destroyed).toBe(0);
  });

  it('Section 4: withAutoCleanupInjectors destroys the route injector after leaving', async () => {
    const routes: Routes = [
      { path: '', component: LabM24Home },
      { path: 'f', providers: [LabM24RouteService], component: LabM24UsesService },
    ];
    const { harness } = await create(routes, withAutoCleanupInjectors());
    await harness.navigateByUrl('/f');
    expect(LabM24RouteService.destroyed).toBe(0);
    await harness.navigateByUrl('/');
    expect(LabM24RouteService.destroyed).toBe(1);
    await harness.navigateByUrl('/f');
    expect(LabM24RouteService.built).toBe(2);
  });
});
