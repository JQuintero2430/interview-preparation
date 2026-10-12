import type { Router, UrlTree } from '@angular/router';

export interface ProductLinkOptions {
  readonly sort?: string;
  readonly ref?: string;
  readonly fragment?: string;
}

/** `/products/<id>/<tab>`, with `sort` as a matrix parameter on the tab segment. */
export function productTabLink(
  router: Router,
  id: number | string,
  tab: string,
  { sort, ref, fragment }: ProductLinkOptions = {},
): UrlTree {
  const matrix = sort ? [{ sort }] : [];
  return router.createUrlTree(['/products', String(id), tab, ...matrix], {
    queryParams: ref ? { ref } : undefined,
    fragment,
  });
}
