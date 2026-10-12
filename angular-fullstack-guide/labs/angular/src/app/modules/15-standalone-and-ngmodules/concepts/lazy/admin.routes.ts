import { Component, inject, Service } from '@angular/core';
import { Routes } from '@angular/router';

// Provided only by the admin routes' `providers`, so the root injector cannot supply it.
@Service({ autoProvided: false })
export class AdminStore {
  readonly users = ['ada', 'linus'];
}

@Component({
  selector: 'lab-m15-admin-users',
  template: '<p>{{ store.users.length }} users</p>',
})
export class AdminUsers {
  readonly store = inject(AdminStore);
}

// The lazy unit is this file: a routes array with its own providers.
export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    providers: [AdminStore],
    children: [
      { path: '', component: AdminUsers },
      { path: 'settings', loadComponent: () => import('./admin-page') },
    ],
  },
];

export default ADMIN_ROUTES;
