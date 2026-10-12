import { Component } from '@angular/core';

// Migration sample: the lazy admin page.
@Component({
  selector: 'lab-m15-mig-admin-page',
  standalone: false,
  template: 'admin <lab-m15-mig-badge label="ops" />',
})
export class AdminPage {}
