import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { LabM32Catalog, LabM32Product } from './catalog';

/** Alternative: an unknown id leaves the product route for the not-found route, whose server route sets the status. */
export const labM32KnownProduct: ResolveFn<LabM32Product | RedirectCommand> = (route) => {
  const router = inject(Router);
  return inject(LabM32Catalog)
    .find(route.paramMap.get('id') ?? '')
    .pipe(map((product) => product ?? new RedirectCommand(router.parseUrl('/m32/ex1/b/not-found'))));
};
