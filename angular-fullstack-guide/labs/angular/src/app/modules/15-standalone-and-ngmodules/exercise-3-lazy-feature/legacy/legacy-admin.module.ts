import { Component, inject, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AdminStore } from '../admin-store';

// Legacy: declared by LegacyAdminModule and routed through RouterModule.forChild.
@Component({
  selector: 'lab-m15-e3-legacy-users',
  standalone: false,
  template: '<p>legacy: {{ store.users().length }} users</p>',
})
export class LegacyUsersPage {
  protected readonly store = inject(AdminStore);
}

// Legacy (kept for comparison): the pre-v14 lazy unit, whose `providers` build the module's own store.
@NgModule({
  declarations: [LegacyUsersPage],
  imports: [RouterModule.forChild([{ path: '', component: LegacyUsersPage }])],
  providers: [AdminStore],
})
export class LegacyAdminModule {}
