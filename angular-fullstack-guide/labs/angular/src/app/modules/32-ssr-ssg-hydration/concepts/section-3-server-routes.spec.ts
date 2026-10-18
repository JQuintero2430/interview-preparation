import { PrerenderFallback, RenderMode, ServerRoute, ServerRoutePrerenderWithParams } from '@angular/ssr';

describe('Section 3: the types of a server route', () => {
  it('Section 3: a Prerender route does not accept a status', () => {
    // @ts-expect-error `ServerRoutePrerender` is `Omit<ServerRouteCommon, 'status'>`: a file has no status per request.
    const route: ServerRoute = { path: 'catalog', renderMode: RenderMode.Prerender, status: 201 };
    const allowed: ServerRoute = { path: 'catalog', renderMode: RenderMode.Server, status: 201 };

    expect(route.renderMode).toBe(RenderMode.Prerender);
    expect(allowed.status).toBe(201);
  });

  it('Section 3: getPrerenderParams must resolve to string values', async () => {
    const route: ServerRoutePrerenderWithParams = {
      path: 'products/:id',
      renderMode: RenderMode.Prerender,
      fallback: PrerenderFallback.None,
      // @ts-expect-error the promise must resolve to `Record<string, string>[]`, not numbers.
      getPrerenderParams: async () => [{ id: 1 }],
    };

    expect(await route.getPrerenderParams()).toEqual([{ id: 1 }]);
  });
});
