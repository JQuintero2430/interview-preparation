import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// The feature's frame: the child pages render in its outlet.
@Component({
  selector: 'lab-m15-e3-admin-shell',
  imports: [RouterOutlet],
  template: `<h2>Admin</h2><router-outlet />`,
})
export class AdminShell {}
