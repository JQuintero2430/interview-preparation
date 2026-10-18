import { Routes } from '@angular/router';

// Module 34's routes (HOUSE-31). Append-only: each task adds its own lines under a comment naming it,
// with paths `m34/<slug>/…`.
export const M34_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./home/home').then((m) => m.LabI18nHome) },
  // SEC-M34-02
  { path: 'm34/intl', loadComponent: () => import('./m34/intl/intl').then((m) => m.LabM34Intl) },
  // SEC-M34-05
  { path: 'm34/icu', loadComponent: () => import('./m34/icu/icu').then((m) => m.LabM34Icu) },
  // SEC-M34-06
  {
    path: 'm34/extract',
    loadComponent: () => import('./m34/extract/extract').then((m) => m.LabM34Extract),
  },
  // SEC-M34-07
  {
    path: 'm34/builds/:id',
    loadComponent: () => import('./m34/builds/builds').then((m) => m.LabM34Builds),
  },
  // SEC-M34-08
  {
    path: 'm34/runtime',
    loadComponent: () => import('./m34/runtime/runtime').then((m) => m.LabM34Runtime),
  },
  // SEC-M34-11
  { path: 'm34/rtl', loadComponent: () => import('./m34/rtl/rtl').then((m) => m.LabM34Rtl) },
  // EX-M34-02
  {
    path: 'm34/ex2/a',
    loadComponent: () => import('./m34/exercise-2-checkout/a/checkout-a').then((m) => m.LabM34Ex2A),
  },
  {
    path: 'm34/ex2/b',
    loadComponent: () => import('./m34/exercise-2-checkout/b/checkout-b').then((m) => m.LabM34Ex2B),
  },
  // EX-M34-04
  {
    path: 'm34/ex4/a',
    loadComponent: () => import('./m34/exercise-4-rtl-card/a/rtl-card-a').then((m) => m.LabM34Ex4A),
  },
  {
    path: 'm34/ex4/b',
    loadComponent: () => import('./m34/exercise-4-rtl-card/b/rtl-card-b').then((m) => m.LabM34Ex4B),
  },
];

export const routes = M34_ROUTES;
