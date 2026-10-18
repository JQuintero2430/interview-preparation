import { Routes } from '@angular/router';

// Module 37's routes (HOUSE-38). Append-only: each task adds its own lines under a comment naming it,
// with paths `m37/<slug>/…`.
export const M37_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./home/home').then((m) => m.LabElementsHome) },
  // SEC-M37-05
  { path: 'm37/caching', loadComponent: () => import('./m37/caching/caching').then((m) => m.LabM37Caching) },
  // SEC-M37-06
  { path: 'm37/updates', loadComponent: () => import('./m37/updates/updates').then((m) => m.LabM37Updates) },
  // SEC-M37-07
  { path: 'm37/push', loadComponent: () => import('./m37/push/push').then((m) => m.LabM37Push) },
  // SEC-M37-08
  { path: 'm37/errors', loadComponent: () => import('./m37/errors/errors').then((m) => m.LabM37Errors) },
  // SEC-M37-10
  { path: 'm37/offline', loadComponent: () => import('./m37/offline/offline').then((m) => m.LabM37Offline) },
  // EX-M37-04
  { path: 'm37/ex4/a', loadChildren: () => import('./m37/exercise-4-update/routes').then((m) => m.EX4_A_ROUTES) },
  { path: 'm37/ex4/b', loadChildren: () => import('./m37/exercise-4-update/routes').then((m) => m.EX4_B_ROUTES) },
  // QB-M37-03
  { path: 'm37/outputs/q11', loadComponent: () => import('./m37/outputs/q11').then((m) => m.LabM37Q11) },
  { path: 'm37/outputs/q12', loadComponent: () => import('./m37/outputs/q12').then((m) => m.LabM37Q12) },
  // QB-M37-04
  { path: 'm37/outputs/q17', loadComponent: () => import('./m37/outputs/q17').then((m) => m.LabM37Q17) },
];

export const routes = M37_ROUTES;
