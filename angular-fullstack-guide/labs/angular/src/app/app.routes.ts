import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'm30', loadChildren: () => import('./modules/30-e2e-and-testing-strategy/demo/routes').then((m) => m.M30_ROUTES) },
  { path: 'm31', loadChildren: () => import('./modules/31-performance/demo/routes').then((m) => m.M31_ROUTES) },
];
