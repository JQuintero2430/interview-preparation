import { Routes } from '@angular/router';
import { AdminShell } from './admin-shell';
import { AdminStore } from './admin-store';
import { UserList } from './user-list';

// The lazy unit: the top route owns the store, the shell and both pages.
export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminShell,
    providers: [AdminStore],
    children: [
      { path: '', component: UserList },
      { path: 'settings', loadComponent: () => import('./settings-page') },
    ],
  },
];

export default ADMIN_ROUTES;
