import { ApplicationRef, Component, Injectable, OnDestroy } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  BaseRouteReuseStrategy,
  CanMatchFn,
  DetachedRouteHandle,
  PreloadAllModules,
  PreloadingStrategy,
  Route,
  RouteReuseStrategy,
  Router,
  RouterOutlet,
  RouterPreloader,
  Routes,
  destroyDetachedRouteHandle,
  provideRouter,
  withPreloading,
} from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Observable, of } from 'rxjs';
import { legacyAssignReuseStrategy } from '../legacy/deprecated-forms';

@Component({ selector: 'lab-m24-preload-root', imports: [RouterOutlet], template: '<router-outlet />' })
class LabM24PreloadRoot {}

@Component({ selector: 'lab-m24-home', template: 'home' })
class LabM24Home {}

@Component({ selector: 'lab-m24-lazy-page', template: 'lazy' })
class LabM24LazyPage {}

@Component({ selector: 'lab-m24-not-found', template: 'not-found' })
class LabM24NotFound {}

@Component({ selector: 'lab-m24-other', template: 'other' })
class LabM24Other {}

/** A routed component that counts how many instances were built and destroyed. */
@Component({ selector: 'lab-m24-counted', template: 'counted' })
class LabM24Counted implements OnDestroy {
  static built = 0;
  static destroyed = 0;

  constructor() {
    LabM24Counted.built++;
  }

  ngOnDestroy(): void {
    LabM24Counted.destroyed++;
  }
}

/** A strategy that preloads only the routes flagged with `data: { preload: true }`. */
@Injectable({ providedIn: 'root' })
class LabM24FlaggedPreloading implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    return route.data?.['preload'] ? load() : of(null);
  }
}

/** A strategy that keeps the routes flagged with `data: { keep: true }` in a map while the user is away. */
@Injectable()
class LabM24KeepAlive extends BaseRouteReuseStrategy {
  readonly stored = new Map<Route, DetachedRouteHandle>();
  readonly storeCalls: (DetachedRouteHandle | null)[] = [];

  override shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return route.data['keep'] === true;
  }

  override store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
    this.storeCalls.push(handle);
    if (!route.routeConfig) {
      return;
    }
    if (handle) {
      this.stored.set(route.routeConfig, handle);
    } else {
      this.stored.delete(route.routeConfig);
    }
  }

  override shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return !!route.routeConfig && this.stored.has(route.routeConfig);
  }

  override retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    return (route.routeConfig && this.stored.get(route.routeConfig)) || null;
  }
}

/** A `loadChildren` loader that counts its calls and returns a one-route array. */
function countingChildren(counter: { calls: number }): () => Promise<Routes> {
  return async () => {
    counter.calls++;
    return [{ path: '', component: LabM24LazyPage }];
  };
}

/** Bootstraps `LabM24PreloadRoot` for real, which starts the router's bootstrap listener, and always cleans up. */
async function withBootstrappedApp(
  providers: Parameters<typeof TestBed.configureTestingModule>[0]['providers'],
  body: (router: Router, host: HTMLElement) => Promise<void>,
): Promise<void> {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers });
  const host = document.createElement('div');
  document.body.appendChild(host);
  const appRef = TestBed.inject(ApplicationRef);
  const ref = appRef.bootstrap(LabM24PreloadRoot, host);
  try {
    await appRef.whenStable();
    await body(TestBed.inject(Router), host);
  } finally {
    ref.destroy();
    host.remove();
  }
}

const deny: CanMatchFn = () => false;

describe('Section 8: preloading strategies and route reuse', () => {
  beforeEach(() => {
    LabM24Counted.built = 0;
    LabM24Counted.destroyed = 0;
  });

  it('Section 8: the harness alone does not start preloading', async () => {
    const counter = { calls: 0 };
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            { path: '', component: LabM24Home },
            { path: 'lazy', loadChildren: countingChildren(counter) },
          ],
          withPreloading(PreloadAllModules),
        ),
      ],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/');
    await TestBed.inject(ApplicationRef).whenStable();
    await new Promise<void>((resolve) => setTimeout(resolve));
    expect(counter.calls).toBe(0);
  });

  it('Section 8: PreloadAllModules loads a lazy route after bootstrap without visiting it', async () => {
    const counter = { calls: 0 };
    const routes: Routes = [
      { path: '', component: LabM24Home },
      { path: 'lazy', loadChildren: countingChildren(counter) },
    ];
    await withBootstrappedApp([provideRouter(routes, withPreloading(PreloadAllModules))], async (router) => {
      await vi.waitFor(() => expect(counter.calls).toBe(1));
      expect(router.url).toBe('/');
    });
  });

  it('Section 8: a custom strategy preloads only flagged routes', async () => {
    const flagged = { calls: 0 };
    const unflagged = { calls: 0 };
    const routes: Routes = [
      { path: 'a', data: { preload: true }, loadChildren: countingChildren(flagged) },
      { path: 'b', loadChildren: countingChildren(unflagged) },
    ];
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideRouter(routes, withPreloading(LabM24FlaggedPreloading))] });
    await new Promise<void>((resolve) => TestBed.inject(RouterPreloader).preload().subscribe({ complete: resolve }));
    expect(flagged.calls).toBe(1);
    expect(unflagged.calls).toBe(0);
  });

  it('Section 8: preloading does not run canMatch guards', async () => {
    const counter = { calls: 0 };
    const routes: Routes = [
      { path: '', component: LabM24Home },
      { path: 'admin', canMatch: [deny], loadChildren: countingChildren(counter) },
      { path: '**', component: LabM24NotFound },
    ];
    await withBootstrappedApp([provideRouter(routes, withPreloading(PreloadAllModules))], async (router, host) => {
      await vi.waitFor(() => expect(counter.calls).toBe(1));
      await router.navigateByUrl('/admin');
      await TestBed.inject(ApplicationRef).whenStable();
      expect(counter.calls).toBe(1);
      expect(host.textContent).toContain('not-found');
    });
  });

  it('Section 8: the default reuse strategy keeps the instance for the same route config', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'c/:id', component: LabM24Counted },
          { path: 'x', component: LabM24Other },
        ]),
      ],
    });
    const harness = await RouterTestingHarness.create();
    const first = await harness.navigateByUrl('/c/1', LabM24Counted);
    const second = await harness.navigateByUrl('/c/2', LabM24Counted);
    expect(second).toBe(first);
    expect(LabM24Counted.built).toBe(1);
    await harness.navigateByUrl('/x', LabM24Other);
    const third = await harness.navigateByUrl('/c/1', LabM24Counted);
    expect(third).not.toBe(first);
    expect(LabM24Counted.built).toBe(2);
    expect(LabM24Counted.destroyed).toBe(1);
  });

  it('Section 8: a detaching strategy reattaches the same instance', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'c/:id', data: { keep: true }, component: LabM24Counted },
          { path: 'x', component: LabM24Other },
        ]),
        { provide: RouteReuseStrategy, useClass: LabM24KeepAlive },
      ],
    });
    const strategy = TestBed.inject(RouteReuseStrategy) as LabM24KeepAlive;
    const harness = await RouterTestingHarness.create();
    const first = await harness.navigateByUrl('/c/1', LabM24Counted);
    await harness.navigateByUrl('/x', LabM24Other);
    expect(strategy.stored.size).toBe(1);
    const again = await harness.navigateByUrl('/c/1', LabM24Counted);
    expect(again).toBe(first);
    expect(LabM24Counted.built).toBe(1);
    expect(LabM24Counted.destroyed).toBe(0);
    expect(strategy.storeCalls.at(-1)).toBeNull();
    expect(strategy.stored.size).toBe(0);
  });

  it('Section 8: a stored handle keeps the component alive until destroyDetachedRouteHandle', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'c/:id', data: { keep: true }, component: LabM24Counted },
          { path: 'x', component: LabM24Other },
        ]),
        { provide: RouteReuseStrategy, useClass: LabM24KeepAlive },
      ],
    });
    const strategy = TestBed.inject(RouteReuseStrategy) as LabM24KeepAlive;
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/c/1', LabM24Counted);
    await harness.navigateByUrl('/x', LabM24Other);
    expect(LabM24Counted.destroyed).toBe(0);
    const [handle] = [...strategy.stored.values()];
    destroyDetachedRouteHandle(handle);
    expect(LabM24Counted.destroyed).toBe(1);
  });

  it('Section 8: assigning router.routeReuseStrategy still takes effect', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'c/:id', data: { keep: true }, component: LabM24Counted },
          { path: 'x', component: LabM24Other },
        ]),
      ],
    });
    legacyAssignReuseStrategy(TestBed.inject(Router), new LabM24KeepAlive());
    const harness = await RouterTestingHarness.create();
    const first = await harness.navigateByUrl('/c/1', LabM24Counted);
    await harness.navigateByUrl('/x', LabM24Other);
    expect(await harness.navigateByUrl('/c/1', LabM24Counted)).toBe(first);
  });

  it('Section 8: jsdom has no navigator.connection to base a preloading decision on', () => {
    expect('connection' in navigator).toBe(false);
  });
});
