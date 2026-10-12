import { Component } from "@angular/core";
import { Badge } from "../shared/badge";

// Migration sample: the lazy admin page.
@Component({
  selector: "lab-m15-mig-admin-page",
  template: 'admin <lab-m15-mig-badge label="ops" />',
  imports: [Badge],
})
export class AdminPage {}
