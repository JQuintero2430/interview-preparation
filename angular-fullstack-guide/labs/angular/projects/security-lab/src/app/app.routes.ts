import { Routes } from '@angular/router';

// Module 33's routes (HOUSE-29). Append-only: each task adds its own lines under a comment naming it,
// with paths `m33/<slug>/…` and page-level providers in the route's `providers`.
export const M33_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./home/home').then((m) => m.LabSecHome) },
  // SEC-M33-01: Section 1, the threat model's order page.
  { path: 'm33/threat/order', loadComponent: () => import('./m33/threat/order-page').then((m) => m.LabM33ThreatOrder) },
  // SEC-M33-02: Section 2, the search page that echoes ?q= four ways.
  { path: 'm33/xss/sinks', loadComponent: () => import('./m33/xss/sinks-page').then((m) => m.LabM33XssSinks) },
  // SEC-M33-03: Section 3, one page with an HTML, a URL and a style binding.
  { path: 'm33/sanitize', loadComponent: () => import('./m33/sanitize/sanitize-page').then((m) => m.LabM33Sanitize) },
  // SEC-M33-05: Section 5, a page with a component style, served under a strict CSP (server/security/05-csp.mjs).
  { path: 'm33/csp', loadComponent: () => import('./m33/csp/csp-page').then((m) => m.LabM33Csp) },
  // SEC-M33-06: Section 6, the Trusted Types pages (server/security/06-trusted-types.mjs), one lazy child route.
  { path: 'm33/tt', loadChildren: () => import('./m33/tt/tt-routes').then((m) => m.M33_TT_ROUTES) },
  // SEC-M33-08: Section 8, one page with the credential in localStorage, in memory or in an HttpOnly cookie (server/security/08-tokens.mjs).
  { path: 'm33/tokens', loadChildren: () => import('./m33/tokens/tokens-routes').then((m) => m.M33_TOKEN_ROUTES) },
  // SEC-M33-09: Section 9, a bank page with a cookie session and an HttpClient POST (server/security/09-csrf.mjs).
  { path: 'm33/csrf/bank', loadComponent: () => import('./m33/csrf/bank-page').then((m) => m.LabM33CsrfBank) },
  // SEC-M33-10: Section 10, a lazy admin route behind canMatch and an admin API (server/security/10-guards.mjs).
  { path: 'm33/guards', loadChildren: () => import('./m33/guards/guards-routes').then((m) => m.M33_GUARD_ROUTES) },
  // EX-M33-02: Exercise 33.2, the locked comments page (server/security/ex2-locked-page.mjs).
  { path: 'm33/ex2', loadChildren: () => import('./m33/exercise-2-locked-page/ex2-routes').then((m) => m.M33_EX2_ROUTES) },
  // EX-M33-03: Exercise 33.3, a transfer form over a cookie session (server/security/ex3-csrf-a.mjs and ex3-csrf-b.mjs).
  { path: 'm33/ex3', loadChildren: () => import('./m33/exercise-3-csrf/ex3-routes').then((m) => m.M33_EX3_ROUTES) },
  // EX-M33-04: Exercise 33.4, an in-memory token with a refresh cookie, or a backend-for-frontend session (server/security/ex4-tokens-a.mjs and ex4-tokens-b.mjs).
  { path: 'm33/ex4', loadChildren: () => import('./m33/exercise-4-token-storage/ex4-routes').then((m) => m.M33_EX4_ROUTES) },
];

export const routes = M33_ROUTES;
