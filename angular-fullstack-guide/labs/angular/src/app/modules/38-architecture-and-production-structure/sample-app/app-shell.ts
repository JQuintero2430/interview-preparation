import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/** The layout shell: app-wide, so it lives at the top of the sample app. */
@Component({
  selector: 'lab-m38-app-shell',
  imports: [RouterOutlet],
  template: `<p>Sample app</p><router-outlet />`,
})
export class LabM38AppShell {}
