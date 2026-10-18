import { Routes } from '@angular/router';

/** `a` is the solution (one block per region), `b` the alternative (the reviews nested inside the recommendations). */
export const INCREMENTAL_PRODUCT_ROUTES: Routes = [
  { path: 'a/product', loadComponent: () => import('./product-detail').then((m) => m.LabM32Ex4ProductDetail) },
  { path: 'b/product', loadComponent: () => import('./nested-product-detail').then((m) => m.LabM32Ex4NestedProductDetail) },
  ...['a', 'b'].map((variant) => ({
    path: `${variant}/start`,
    loadComponent: () => import('./start-page').then((m) => m.LabM32Ex4Start),
  })),
];
