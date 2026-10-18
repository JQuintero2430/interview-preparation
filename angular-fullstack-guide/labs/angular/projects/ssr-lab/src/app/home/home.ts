import { Component, signal } from '@angular/core';

@Component({
  selector: 'lab-ssr-home',
  template: `
    <h2>Module 32 SSR lab</h2>
    <p>This page is rendered by the server and hydrated in the browser.</p>
    <button type="button" (click)="clicks.set(clicks() + 1)">Clicked {{ clicks() }} times</button>
  `,
})
export class LabSsrHome {
  protected readonly clicks = signal(0);
}
