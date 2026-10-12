import { Component, inject } from '@angular/core';
import { AdminStore } from './admin-store';

// A default export, so `loadComponent: () => import('./settings-page')` needs no `.then`.
@Component({
  selector: 'lab-m15-e3-settings-page',
  template: '<p>{{ store.users().length }} users to manage</p>',
})
export default class SettingsPage {
  protected readonly store = inject(AdminStore);
}
