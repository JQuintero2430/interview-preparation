import { isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID } from '@angular/core';

/** Renders a different element per platform: the server writes the `@else` branch, the browser's first render takes the `@if` branch. */
@Component({
  selector: 'lab-m32-hydration-branch-swap',
  template: `
    <h2>Hydration: a branch chosen by platform</h2>
    @if (isBrowser) {
      <section>Browser branch</section>
    } @else {
      <article>Server branch</article>
    }
    <button type="button" (click)="clicks = clicks + 1">Clicks: {{ clicks }}</button>
  `,
})
export class LabM32HydrationBranchSwap {
  protected readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  protected clicks = 0;
}
