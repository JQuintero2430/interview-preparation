import { Routes } from '@angular/router';
import { LAB_M33_EX3_API, LabM33Ex3Transfer } from './transfer-page';

/**
 * Exercise 33.3: the same page over two APIs, chosen by a route-level provider. server/security/ex3-csrf-a.mjs
 * (solution) and ex3-csrf-b.mjs (alternative) answer under `/api/m33/ex3/a/` and `/b/`.
 */
export const M33_EX3_ROUTES: Routes = [
  { path: 'a', component: LabM33Ex3Transfer, providers: [{ provide: LAB_M33_EX3_API, useValue: '/api/m33/ex3/a/' }] },
  { path: 'b', component: LabM33Ex3Transfer, providers: [{ provide: LAB_M33_EX3_API, useValue: '/api/m33/ex3/b/' }] },
];
