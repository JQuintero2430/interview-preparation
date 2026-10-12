import { Component, input } from '@angular/core';

// Migration sample: a shared component.
@Component({
  selector: 'lab-m15-mig-badge',
  standalone: false,
  template: '[{{ label() }}]',
})
export class Badge {
  readonly label = input('');
}
