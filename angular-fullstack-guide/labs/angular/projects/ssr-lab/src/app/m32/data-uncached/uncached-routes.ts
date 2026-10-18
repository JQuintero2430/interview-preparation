import { provideHttpClient } from '@angular/common/http';
import { Routes } from '@angular/router';

/** QB-M32-05: the page whose request passes `transferCache: false`; `provideHttpClient()` sits on the route. */
export const UNCACHED_ROUTES: Routes = [
  {
    path: '',
    providers: [provideHttpClient()],
    loadComponent: () => import('./uncached-page').then((m) => m.LabM32DataUncached),
  },
];
