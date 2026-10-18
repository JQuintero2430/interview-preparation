import { Routes } from '@angular/router';
import { LAB_M32_EX2_RECENT_STORE, labM32Ex2RecentStoreFactory } from './recent-store';

/** `broken` is the exercise's "before", `a` the solution and `b` the alternative (its store is provided on the route). */
export const SAFE_WIDGET_ROUTES: Routes = [
  { path: 'broken', loadComponent: () => import('./broken-page').then((m) => m.LabM32Ex2Broken) },
  { path: 'a', loadComponent: () => import('./recent-items').then((m) => m.LabM32Ex2RecentItems) },
  {
    path: 'b',
    providers: [{ provide: LAB_M32_EX2_RECENT_STORE, useFactory: labM32Ex2RecentStoreFactory }],
    loadComponent: () => import('./stored-recent-items').then((m) => m.LabM32Ex2StoredRecentItems),
  },
];
