import { Component } from '@angular/core';
import { Dashboard } from './dashboard';

@Component({
  selector: 'lab-m20-dashboard-host',
  imports: [Dashboard],
  template: `<lab-m20-dashboard />`,
})
export class DashboardHost {}
