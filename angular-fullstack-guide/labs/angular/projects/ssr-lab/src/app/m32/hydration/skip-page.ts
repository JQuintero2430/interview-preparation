import { Component, signal } from '@angular/core';

/** A child the page opts out of hydration: the browser clears its host and renders it again. */
@Component({
  selector: 'lab-m32-skipped-card',
  template: `<p>Skipped card content</p>`,
})
export class LabM32SkippedCard {}

@Component({
  selector: 'lab-m32-hydration-skip',
  imports: [LabM32SkippedCard],
  template: `
    <h2>Hydration: skipped child</h2>
    <lab-m32-skipped-card ngSkipHydration />
    <button type="button" (click)="clicks.set(clicks() + 1)">Clicks: {{ clicks() }}</button>
  `,
})
export class LabM32HydrationSkip {
  protected readonly clicks = signal(0);
}
