import { provideHttpClient } from '@angular/common/http';
import { Routes } from '@angular/router';

/** The pages of section 8; `provideHttpClient()` sits on the parent route, so the pages share one `HttpClient`. */
export const DATA_ROUTES: Routes = [
  {
    path: '',
    providers: [provideHttpClient()],
    children: [
      ...['products', 'products-again'].map((path) => ({
        path,
        loadComponent: () => import('./products-page').then((m) => m.LabM32DataProducts),
      })),
      { path: 'me', loadComponent: () => import('./me-page').then((m) => m.LabM32DataMe) },
      { path: 'state', loadComponent: () => import('./state-page').then((m) => m.LabM32DataState) },
    ],
  },
];
