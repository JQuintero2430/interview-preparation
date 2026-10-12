// LEGACY: older ways to read route parameters, kept for the guide's `#### Legacy` subsections of module 24 and
// for the specs of the task that created them. New code binds parameters to inputs with `withComponentInputBinding()`
// and signal inputs. SEC-M24-05 to SEC-M24-09 add exports below this block and keep these unchanged.
import { Component, Injectable, OnInit, inject } from '@angular/core';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  CanActivate,
  ExtraOptions,
  Resolve,
  Route,
  RouteReuseStrategy,
  Router,
  UrlTree,
  mapToCanActivate,
  mapToResolve,
  withRouterConfig,
} from '@angular/router';

/** Legacy: a snapshot read once in the constructor. A reused component keeps the first value. Replacement: an input bound by `withComponentInputBinding()`. */
@Component({ selector: 'lab-m24-legacy-stale-product', template: '{{ id }}' })
export class LabM24LegacyStaleProduct {
  readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id');
}

/** Legacy: a subscription to `paramMap` in `ngOnInit`. It stays current, but every read needs a subscription and its teardown. Replacement: an input. */
@Component({ selector: 'lab-m24-legacy-param-map-product', template: '{{ id }}' })
export class LabM24LegacyParamMapProduct implements OnInit {
  private readonly route = inject(ActivatedRoute);
  id: string | null = null;

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.id = params.get('id');
    });
  }
}

/** Legacy: the pre-v22 parameter inheritance, restored on purpose. Replacement: the v22 default, `'always'`. */
export const legacyEmptyOnlyInheritance = withRouterConfig({ paramsInheritanceStrategy: 'emptyOnly' });

/** Legacy: a class guard. Replacement: a `CanActivateFn` that calls `inject()`. */
@Injectable({ providedIn: 'root' })
export class LabM24LegacyAuthGuard implements CanActivate {
  private readonly router = inject(Router);

  canActivate(): UrlTree {
    return this.router.parseUrl('/login?legacy=class');
  }
}

/** Legacy: the class guard converted to functions by `mapToCanActivate`. Replacement: a `CanActivateFn`. */
export const legacyMappedGuards = mapToCanActivate([LabM24LegacyAuthGuard]);

/** Legacy: the class itself in the guard array (the deprecated token form). Replacement: a `CanActivateFn`. */
export const legacyTokenGuards: Route['canActivate'] = [LabM24LegacyAuthGuard];

/** Counts the calls of the loader of `legacyCanLoadRoute`. */
export const legacyLoaderCalls = { count: 0 };

/** Legacy: `canLoad` is deprecated in the 22.2.1 typings. Replacement: `canMatch`. */
export const legacyCanLoadRoute: Route = {
  path: 'reports',
  canLoad: [() => false],
  loadChildren: () => {
    legacyLoaderCalls.count++;
    return [];
  },
};

/** Legacy: a class resolver implementing `Resolve<T>`. Replacement: a `ResolveFn` that calls `inject()`. */
@Injectable({ providedIn: 'root' })
export class LabM24LegacyProductResolver implements Resolve<string> {
  resolve(route: ActivatedRouteSnapshot): string {
    return `product-${route.paramMap.get('id')}`;
  }
}

/** Legacy: the class resolver converted to a function by `mapToResolve`. Replacement: the function written directly. */
export const legacyMappedResolver = mapToResolve(LabM24LegacyProductResolver);

/** Legacy: `getCurrentNavigation()` is deprecated since v20.2 in the 22.2.1 typings. Replacement: the `currentNavigation` signal. */
export function legacyCurrentNavigationUrl(router: Router): string | null {
  return router.getCurrentNavigation()?.extractedUrl.toString() ?? null;
}

/** Legacy: `Router.isActive(url, matchOptions)` is deprecated since v21.1 and returns a boolean read once. Replacement: the `isActive` function, which returns a signal. */
export function legacyIsActiveSnapshot(router: Router, url: string): boolean {
  return router.isActive(url, { paths: 'exact', queryParams: 'ignored', fragment: 'ignored', matrixParams: 'ignored' });
}

/** Legacy: assigning `router.routeReuseStrategy` is deprecated in the 22.2.1 typings. Replacement: `{ provide: RouteReuseStrategy, useClass: MyStrategy }` in the providers. */
export function legacyAssignReuseStrategy(router: Router, strategy: RouteReuseStrategy): void {
  router.routeReuseStrategy = strategy;
}

/** Legacy: the `RouterModule.forRoot` scrolling options. Replacement: `withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' })`. */
export const legacyScrollingExtraOptions: ExtraOptions = {
  scrollPositionRestoration: 'enabled',
  anchorScrolling: 'enabled',
};

/** Legacy: `ExtraOptions.enableViewTransitions` is `@experimental 17.0` in the 22.2.1 typings. Replacement: `withViewTransitions()`. */
export const legacyViewTransitionsExtraOptions: ExtraOptions = { enableViewTransitions: true };

/** Legacy: the `RouterModule.forRoot` hash option. Replacement: `provideRouter(routes, withHashLocation())`. */
export const legacyHashExtraOptions: ExtraOptions = { useHash: true };
