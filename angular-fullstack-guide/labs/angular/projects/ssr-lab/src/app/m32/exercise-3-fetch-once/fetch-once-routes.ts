import { provideHttpClient } from '@angular/common/http';
import { Routes } from '@angular/router';

/**
 * `a` is the solution (`HttpClient` and `TransferState`), `b` the alternative (`httpResource` and a `resource` with an `id`).
 * `provideHttpClient()` sits on the parent route, so both variants and both pages share one `HttpClient`.
 */
export const FETCH_ONCE_ROUTES: Routes = [
  {
    path: '',
    providers: [provideHttpClient()],
    children: [
      { path: 'a/products', loadComponent: () => import('./products-page').then((m) => m.LabM32Ex3Products) },
      { path: 'b/products', loadComponent: () => import('./resource-products-page').then((m) => m.LabM32Ex3ResourceProducts) },
      ...['a', 'b'].map((variant) => ({
        path: `${variant}/other`,
        loadComponent: () => import('./other-page').then((m) => m.LabM32Ex3Other),
      })),
    ],
  },
];
