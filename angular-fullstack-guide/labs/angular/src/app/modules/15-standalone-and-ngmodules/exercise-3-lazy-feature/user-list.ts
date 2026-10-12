import { Component, inject } from '@angular/core';
import { AdminStore } from './admin-store';

@Component({
  selector: 'lab-m15-e3-user-list',
  template: `
    <ul>
      @for (user of store.users(); track user) {
        <li>{{ user }}</li>
      }
    </ul>
  `,
})
export class UserList {
  protected readonly store = inject(AdminStore);
}
