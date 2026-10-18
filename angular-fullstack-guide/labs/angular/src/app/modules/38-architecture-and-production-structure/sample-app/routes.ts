import { Routes } from '@angular/router';
import { LabM38AppShell } from './app-shell';

// Append-only: each feature adds its own lazy route line under the shell.
export const sampleRoutes: Routes = [
  {
    path: '',
    component: LabM38AppShell,
    children: [
      { path: 'orders', loadChildren: () => import('./features/orders/routes') },
      { path: 'catalog', loadChildren: () => import('./features/catalog/routes') },
    ],
  },
];
