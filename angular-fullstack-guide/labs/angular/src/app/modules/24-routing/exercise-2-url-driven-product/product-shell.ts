import { Component, input } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'lab-m24-product-shell',
  imports: [RouterOutlet],
  template: `<h2>Product {{ id() }}</h2>
    <router-outlet />`,
})
export class LabM24ProductShell {
  readonly id = input<string>();
}
