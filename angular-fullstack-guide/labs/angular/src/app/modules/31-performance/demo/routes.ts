import { Routes } from '@angular/router';

/** Append-only: each module-31 task that needs a page adds its own `loadComponent` line. */
export const M31_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'home', loadComponent: () => import('./m31-home').then((m) => m.LabM31Home) },
  { path: 'long-list', loadComponent: () => import('./long-list').then((m) => m.LabM31LongList) },
  { path: 'loading', loadComponent: () => import('./loading').then((m) => m.LabM31Loading) },
  { path: 'tree-shaking', loadComponent: () => import('./tree-shaking-page').then((m) => m.LabM31TreeShaking) },
  { path: 'leaks', loadComponent: () => import('./leaks').then((m) => m.LabM31Leaks) },
  { path: 'worker', loadComponent: () => import('./worker-page').then((m) => m.LabM31WorkerPage) },
  { path: 'log-viewer', loadComponent: () => import('../exercise-2-log-viewer/log-viewer').then((m) => m.LabM31LogViewer) },
  { path: 'leak-hunt', loadComponent: () => import('../exercise-4-leak-hunt/leak-hunt').then((m) => m.LabM31LeakHunt) },
  { path: 'primes', loadComponent: () => import('../exercise-5-worker/primes-page').then((m) => m.LabM31PrimesPage) },
];
