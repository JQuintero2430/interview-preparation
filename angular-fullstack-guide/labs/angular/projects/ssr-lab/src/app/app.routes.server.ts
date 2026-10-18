import { PrerenderFallback, RenderMode, ServerRoute } from '@angular/ssr';
import { LAB_M32_CATALOG_CACHE_CONTROL, labM32BuildParams } from './m32/exercise-1-catalog-routes/catalog';

/** The ids built at build time (SEC-M32-03). */
const prerenderIds = async (): Promise<Record<string, string>[]> => [{ id: '1' }, { id: '2' }];

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  // SEC-M32-01
  { path: 'm32/why/client', renderMode: RenderMode.Client },
  { path: 'm32/why/server', renderMode: RenderMode.Server },
  // SEC-M32-03
  { path: 'm32/routes/prerendered', renderMode: RenderMode.Prerender, headers: { 'X-Lab-Mode': 'prerender' } },
  { path: 'm32/routes/server', renderMode: RenderMode.Server },
  { path: 'm32/routes/client', renderMode: RenderMode.Client },
  { path: 'm32/routes/headers', renderMode: RenderMode.Server, status: 201, headers: { 'X-Lab-Mode': 'server' } },
  { path: 'm32/routes/products/:id', renderMode: RenderMode.Prerender, getPrerenderParams: prerenderIds },
  {
    path: 'm32/routes/shelf-client/:id',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.Client,
    getPrerenderParams: prerenderIds,
  },
  {
    path: 'm32/routes/shelf-none/:id',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.None,
    getPrerenderParams: prerenderIds,
  },
  { path: 'm32/routes/old', renderMode: RenderMode.Server, status: 301 },
  { path: 'm32/routes/moved', renderMode: RenderMode.Prerender },
  // QB-M32-02 (Q32.07): the same ids and page behind each fallback.
  {
    path: 'm32/fallbacks/server/:id',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.Server,
    getPrerenderParams: prerenderIds,
  },
  {
    path: 'm32/fallbacks/client/:id',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.Client,
    getPrerenderParams: prerenderIds,
  },
  {
    path: 'm32/fallbacks/none/:id',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.None,
    getPrerenderParams: prerenderIds,
  },
  // SEC-M32-04: pages that fail hydration are never prerendered.
  ...['plain', 'skip', 'dom-append', 'invalid-nesting'].map(
    (page): ServerRoute => ({ path: `m32/hydration/${page}`, renderMode: RenderMode.Server }),
  ),
  // QB-M32-03: the page is Server, never Prerender, because its first browser render differs.
  { path: 'm32/hydration/branch-swap', renderMode: RenderMode.Server },
  // SEC-M32-05
  { path: 'm32/replay/cart', renderMode: RenderMode.Server },
  // SEC-M32-06
  { path: 'm32/incremental/product', renderMode: RenderMode.Server },
  // SEC-M32-07: the crash page fails on the server, so it is never prerendered.
  ...['window-crash', 'after-render', 'not-found-page', 'language', 'pending'].map(
    (page): ServerRoute => ({ path: `m32/platform/${page}`, renderMode: RenderMode.Server }),
  ),
  { path: 'm32/platform/language-static', renderMode: RenderMode.Prerender },
  // SEC-M32-08
  ...['products', 'products-again', 'me', 'state'].map(
    (page): ServerRoute => ({ path: `m32/data/${page}`, renderMode: RenderMode.Server }),
  ),
  // SEC-M32-09: the page differs per request, so no shared cache may store it.
  { path: 'm32/deploy/greeting', renderMode: RenderMode.Server, headers: { 'Cache-Control': 'private, no-store' } },
  // EX-M32-01: both variants prerender the build's products; the rest fall back to the default (Server).
  ...['a', 'b'].flatMap((variant): ServerRoute[] => [
    {
      path: `m32/ex1/${variant}/products/:id`,
      renderMode: RenderMode.Prerender,
      getPrerenderParams: labM32BuildParams,
      headers: { 'Cache-Control': LAB_M32_CATALOG_CACHE_CONTROL },
    },
    { path: `m32/ex1/${variant}/account`, renderMode: RenderMode.Client },
  ]),
  { path: 'm32/ex1/b/not-found', renderMode: RenderMode.Server, status: 404 },
  // EX-M32-02: the broken page fails on the server, so none of the three is prerendered.
  ...['broken', 'a', 'b'].map((page): ServerRoute => ({ path: `m32/ex2/${page}`, renderMode: RenderMode.Server })),
  // EX-M32-03: the products pages carry server data to the browser, so both are rendered on request.
  ...['a', 'b'].flatMap((variant): ServerRoute[] => [
    { path: `m32/ex3/${variant}/products`, renderMode: RenderMode.Server },
    { path: `m32/ex3/${variant}/other`, renderMode: RenderMode.Server },
  ]),
  // EX-M32-04: the product pages are rendered on request, like section 6's page.
  ...['a', 'b'].flatMap((variant): ServerRoute[] => [
    { path: `m32/ex4/${variant}/product`, renderMode: RenderMode.Server },
    { path: `m32/ex4/${variant}/start`, renderMode: RenderMode.Server },
  ]),
  // QB-M32-05: rendered on request, like section 8's pages.
  { path: 'm32/data-uncached', renderMode: RenderMode.Server },
  // SEC-M33-07: both pages echo request data, so both are rendered on request.
  ...['echo', 'state'].map((page): ServerRoute => ({ path: `m33/ssr/${page}`, renderMode: RenderMode.Server })),
  { path: '**', renderMode: RenderMode.Server },
];
