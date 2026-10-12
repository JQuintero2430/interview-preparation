import { inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import {
  RedirectCommand,
  Router,
  Routes,
  provideRouter,
  withComponentInputBinding,
  withNavigationErrorHandler,
  withRouterResources,
} from '@angular/router';
import { of, switchMap, throwError } from 'rxjs';
import { LabM24ProductApi } from './product-api';
import { LabM24LoadingError, LabM24LoadingHome, LabM24LoadingNotFound, LabM24ProductPage } from './product-page';
import { productResolver } from './product.resolver';

export const PRODUCT_LOADING_ROUTES: Routes = [
  { path: '', component: LabM24LoadingHome },
  { path: 'not-found', component: LabM24LoadingNotFound },
  { path: 'error', component: LabM24LoadingError },
  { path: 'products/:id', resolve: { product: productResolver }, component: LabM24ProductPage },
  {
    // The `resources` property and `withRouterResources()` are developer preview.
    path: 'resource-products/:id',
    component: LabM24ProductPage,
    resources: ({ params }) => {
      const api = inject(LabM24ProductApi);
      return {
        product: rxResource({
          params: () => params()['id'],
          stream: ({ params: id }) =>
            api
              .load(id)
              .pipe(switchMap((product) => (product ? of(product) : throwError(() => new Error('unknown product'))))),
        }),
      };
    },
  },
];

/** The router for the exercise: input binding, router resources and an error handler that redirects to `/error`. */
export function provideProductLoading() {
  return provideRouter(
    PRODUCT_LOADING_ROUTES,
    withComponentInputBinding(),
    withRouterResources(),
    withNavigationErrorHandler(() => new RedirectCommand(inject(Router).parseUrl('/error'))),
  );
}
