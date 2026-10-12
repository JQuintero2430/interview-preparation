import { Component, inject, input } from '@angular/core';
import { Greeter } from './greeter';

// Migration sample: the greeting component.
@Component({
  selector: 'lab-m15-mig-hello',
  standalone: false,
  template: `
    <p *ngIf="name()">{{ greeter.greet(name()) }} <lab-m15-mig-badge [label]="name() | m15Short" /></p>
  `,
})
export class Hello {
  readonly name = input('');
  protected readonly greeter = inject(Greeter);
}
