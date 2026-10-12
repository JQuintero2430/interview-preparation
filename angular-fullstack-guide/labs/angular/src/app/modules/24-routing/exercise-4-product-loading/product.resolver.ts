import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { LabM24Product, LabM24ProductApi } from './product-api';

/** Resolves the product of `:id`; an unknown id redirects to `/not-found` and keeps the requested URL in the address bar. */
export const productResolver: ResolveFn<LabM24Product> = (route, state) => {
  const router = inject(Router);
  return inject(LabM24ProductApi)
    .load(route.paramMap.get('id') ?? '')
    .pipe(
      map(
        (product) =>
          product ??
          new RedirectCommand(router.parseUrl('/not-found'), { browserUrl: router.parseUrl(state.url) }),
      ),
    );
};
