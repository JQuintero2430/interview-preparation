import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet, RouterLink],
  selector: 'lab-root',
  template: `
    <h1>Angular SSR labs</h1>
    <nav><a routerLink="/">Home</a></nav>
    <router-outlet />
  `,
})
export class App {}
