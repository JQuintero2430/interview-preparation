import { Routes } from '@angular/router';

export const M32_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./home/home').then((m) => m.LabSsrHome) },
  // SEC-M32-01: one page, two render modes (see app.routes.server.ts).
  { path: 'm32/why/client', loadComponent: () => import('./m32/why/product-page').then((m) => m.LabM32WhyProduct) },
  { path: 'm32/why/server', loadComponent: () => import('./m32/why/product-page').then((m) => m.LabM32WhyProduct) },
  // SEC-M32-02: a nested path served by the generated `'**'` server route.
  { path: 'm32/setup/orders/42', loadComponent: () => import('./m32/setup/deep-link-page').then((m) => m.LabM32SetupDeepLink) },
  // SEC-M32-03: one route per server route in app.routes.server.ts.
  ...['prerendered', 'server', 'client', 'headers'].map((mode) => ({
    path: `m32/routes/${mode}`,
    data: { mode },
    loadComponent: () => import('./m32/routes/route-page').then((m) => m.LabM32RoutesPage),
  })),
  ...['products', 'shelf-client', 'shelf-none'].map((name) => ({
    path: `m32/routes/${name}/:id`,
    loadComponent: () => import('./m32/routes/product-page').then((m) => m.LabM32RoutesProduct),
  })),
  { path: 'm32/routes/old', redirectTo: '/m32/routes/server' },
  { path: 'm32/routes/moved', redirectTo: '/m32/routes/prerendered' },
  // QB-M32-02 (Q32.07): one page behind three fallbacks, one route per server route in app.routes.server.ts.
  ...['server', 'client', 'none'].map((fallback) => ({
    path: `m32/fallbacks/${fallback}/:id`,
    loadComponent: () => import('./m32/fallbacks/product-page').then((m) => m.LabM32FallbacksProduct),
  })),
  // SEC-M32-04: hydration pages, all RenderMode.Server (app.routes.server.ts).
  { path: 'm32/hydration/plain', loadComponent: () => import('./m32/hydration/plain-page').then((m) => m.LabM32HydrationPlain) },
  { path: 'm32/hydration/skip', loadComponent: () => import('./m32/hydration/skip-page').then((m) => m.LabM32HydrationSkip) },
  {
    path: 'm32/hydration/dom-append',
    loadComponent: () => import('./m32/hydration/dom-append-page').then((m) => m.LabM32HydrationDomAppend),
  },
  {
    path: 'm32/hydration/invalid-nesting',
    loadComponent: () => import('./m32/hydration/invalid-nesting-page').then((m) => m.LabM32HydrationInvalidNesting),
  },
  // QB-M32-03: a branch chosen by platform, RenderMode.Server (app.routes.server.ts).
  {
    path: 'm32/hydration/branch-swap',
    loadComponent: () => import('./m32/hydration/branch-swap-page').then((m) => m.LabM32HydrationBranchSwap),
  },
  // SEC-M32-05: a page with one click listener, RenderMode.Server (app.routes.server.ts).
  { path: 'm32/replay/cart', loadComponent: () => import('./m32/replay/cart-page').then((m) => m.LabM32ReplayCart) },
  // SEC-M32-06: incremental hydration, RenderMode.Server (app.routes.server.ts).
  {
    path: 'm32/incremental/product',
    loadComponent: () => import('./m32/incremental/product-page').then((m) => m.LabM32IncrementalProduct),
  },
  // SEC-M32-07: platform-safe code; all RenderMode.Server except `language-static` (Prerender), see app.routes.server.ts.
  {
    path: 'm32/platform/window-crash',
    loadComponent: () => import('./m32/platform/window-crash-page').then((m) => m.LabM32PlatformWindowCrash),
  },
  {
    path: 'm32/platform/after-render',
    loadComponent: () => import('./m32/platform/after-render-page').then((m) => m.LabM32PlatformAfterRender),
  },
  {
    path: 'm32/platform/not-found-page',
    loadComponent: () => import('./m32/platform/not-found-page').then((m) => m.LabM32PlatformNotFound),
  },
  ...['language', 'language-static'].map((name) => ({
    path: `m32/platform/${name}`,
    loadComponent: () => import('./m32/platform/language-page').then((m) => m.LabM32PlatformLanguage),
  })),
  { path: 'm32/platform/pending', loadComponent: () => import('./m32/platform/pending-page').then((m) => m.LabM32PlatformPending) },
  // SEC-M32-08: data across the boundary; the pages and their `HttpClient` provider live in m32/data/data-routes.ts.
  { path: 'm32/data', loadChildren: () => import('./m32/data/data-routes').then((m) => m.DATA_ROUTES) },
  // SEC-M32-09: a per-request page (it shows Accept-Language), sent with a private Cache-Control (app.routes.server.ts).
  {
    path: 'm32/deploy/greeting',
    loadComponent: () => import('./m32/platform/language-page').then((m) => m.LabM32PlatformLanguage),
  },
  // EX-M32-01: the catalog exercise; the routes and their providers live in m32/exercise-1-catalog-routes/catalog-routes.ts.
  {
    path: 'm32/ex1',
    loadChildren: () => import('./m32/exercise-1-catalog-routes/catalog-routes').then((m) => m.CATALOG_ROUTES),
  },
  // EX-M32-02: the safe-widget exercise; the routes and the alternative's provider live in m32/exercise-2-safe-widget/safe-widget-routes.ts.
  {
    path: 'm32/ex2',
    loadChildren: () => import('./m32/exercise-2-safe-widget/safe-widget-routes').then((m) => m.SAFE_WIDGET_ROUTES),
  },
  // EX-M32-03: the fetch-once exercise; the routes and the shared `HttpClient` provider live in m32/exercise-3-fetch-once/fetch-once-routes.ts.
  {
    path: 'm32/ex3',
    loadChildren: () => import('./m32/exercise-3-fetch-once/fetch-once-routes').then((m) => m.FETCH_ONCE_ROUTES),
  },
  // EX-M32-04: the incremental-hydration exercise; the routes live in m32/exercise-4-incremental-product/incremental-product-routes.ts.
  {
    path: 'm32/ex4',
    loadChildren: () =>
      import('./m32/exercise-4-incremental-product/incremental-product-routes').then((m) => m.INCREMENTAL_PRODUCT_ROUTES),
  },
  // QB-M32-05: the same list with `transferCache: false` on its request, for Q32.22 (m32/data-uncached/).
  {
    path: 'm32/data-uncached',
    loadChildren: () => import('./m32/data-uncached/uncached-routes').then((m) => m.UNCACHED_ROUTES),
  },
  // SEC-M33-07: Section 7, server-rendered pages that echo request data (RenderMode.Server, see app.routes.server.ts).
  { path: 'm33/ssr/echo', loadComponent: () => import('./m33/ssr/echo-page').then((m) => m.LabM33SsrEcho) },
  { path: 'm33/ssr/state', loadComponent: () => import('./m33/ssr/state-page').then((m) => m.LabM33SsrState) },
];

/** Name the generated `app.config.ts` imports. */
export const routes = M32_ROUTES;
