import { Routes } from '@angular/router';
import { LabM33TtBypass } from './tt-bypass-page';
import { LabM33TtPage } from './tt-page';

/**
 * Section 6: the Trusted Types pages, served with a `require-trusted-types-for 'script'` header by
 * server/security/06-trusted-types.mjs. `lazy` is the one child whose component loads as its own chunk after boot.
 */
export const M33_TT_ROUTES: Routes = [
  { path: '', component: LabM33TtPage },
  { path: 'bypass', component: LabM33TtBypass },
  { path: 'lazy', loadComponent: () => import('./tt-lazy-page').then((m) => m.LabM33TtLazy) },
];
