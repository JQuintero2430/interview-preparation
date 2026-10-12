import { Component } from '@angular/core';

// Migration sample: the root component.
@Component({
  selector: 'lab-m15-mig-app',
  standalone: false,
  template: '<lab-m15-mig-hello name="Ada" /><router-outlet />',
})
export class App {}
