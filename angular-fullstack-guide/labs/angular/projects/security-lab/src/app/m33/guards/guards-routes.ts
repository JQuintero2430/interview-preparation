import { Routes } from '@angular/router';
import { LabM33GuardsFallback } from './fallback-page';
import { LabM33GuardsHome } from './home-page';
import { isAdmin } from './is-admin';

/** Section 10: the admin route is lazy and behind `canMatch`; a second route with the same path is the fallback. */
export const M33_GUARD_ROUTES: Routes = [
  { path: '', component: LabM33GuardsHome },
  { path: 'admin', canMatch: [isAdmin], loadComponent: () => import('./admin-page') },
  { path: 'admin', component: LabM33GuardsFallback },
];
