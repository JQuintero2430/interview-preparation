import { Component, signal } from '@angular/core';

/** A page with nothing that breaks hydration: the browser takes over the server's nodes. */
@Component({
  selector: 'lab-m32-hydration-plain',
  template: `
    <h2>Hydration: plain page</h2>
    <p>Rendered on the server, taken over in the browser.</p>
    <button type="button" (click)="clicks.set(clicks() + 1)">Clicks: {{ clicks() }}</button>
  `,
})
export class LabM32HydrationPlain {
  protected readonly clicks = signal(0);
}
