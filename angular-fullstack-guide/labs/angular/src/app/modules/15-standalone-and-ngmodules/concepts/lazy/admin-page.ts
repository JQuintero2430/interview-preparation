import { Component, inject } from '@angular/core';
import { AdminStore } from './admin.routes';

// A default export, so `loadComponent: () => import('./admin-page')` needs no `.then`.
@Component({
  selector: 'lab-m15-admin-settings',
  template: '<p>settings for {{ store.users.length }} users</p>',
})
export default class AdminSettings {
  readonly store = inject(AdminStore);
}
