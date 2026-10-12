import { Component, inject, Injectable, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

// Legacy: provided by the lazy module, so it lives in the module's own injector.
@Injectable()
export class LegacyAdminStore {
  readonly users = ['grace'];
}

// Legacy: declared by LegacyAdminModule and routed through RouterModule.forChild.
@Component({
  selector: 'lab-m15-legacy-admin',
  standalone: false,
  template: '<p>legacy admin: {{ store.users.length }} user</p>',
})
export class LegacyAdminPage {
  readonly store = inject(LegacyAdminStore);
}

// Legacy: a lazy-loaded feature module, the only lazy unit before v14.
@NgModule({
  declarations: [LegacyAdminPage],
  imports: [RouterModule.forChild([{ path: '', component: LegacyAdminPage }])],
  providers: [LegacyAdminStore],
})
export class LegacyAdminModule {}
