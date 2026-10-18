import { provideHttpClient } from '@angular/common/http';
import { Routes } from '@angular/router';
import { LabM32Catalog } from './catalog';
import { labM32KnownProduct } from './known-product';

const account = () => import('./account-page').then((m) => m.LabM32Ex1Account);

/** `a/` is the solution and `b/` the alternative; the catalog and `HttpClient` are provided on the parent route. */
export const CATALOG_ROUTES: Routes = [
  {
    path: '',
    providers: [provideHttpClient(), LabM32Catalog],
    children: [
      { path: 'a/account', loadComponent: account },
      { path: 'a/products/:id', loadComponent: () => import('./product-page').then((m) => m.LabM32Ex1Product) },
      { path: 'b/account', loadComponent: account },
      {
        path: 'b/products/:id',
        resolve: { product: labM32KnownProduct },
        loadComponent: () => import('./resolved-product-page').then((m) => m.LabM32Ex1ResolvedProduct),
      },
      { path: 'b/not-found', loadComponent: () => import('./not-found').then((m) => m.LabM32Ex1NotFound) },
    ],
  },
];
