import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";

import { AdminPage } from "./admin-page";

// Migration sample: a lazy feature module with its own child routes.
@NgModule({
  imports: [
    RouterModule.forChild([{ path: "", component: AdminPage }]),
    AdminPage,
  ],
})
export class AdminModule {}
