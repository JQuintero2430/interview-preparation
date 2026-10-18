import { Component, inject, signal } from '@angular/core';
import { CdkMonitorFocus, CdkTrapFocus, LiveAnnouncer, type FocusOrigin } from '@angular/cdk/a11y';

/**
 * The CDK's focus helpers on one page: `cdkMonitorElementFocus` (which origin focused the button, as classes and as an output),
 * `cdkTrapFocus` around two buttons (with plain buttons outside it), and a `LiveAnnouncer` button. The text of each `output` is what the tests read.
 */
@Component({
  selector: 'lab-m36-a11y',
  imports: [CdkMonitorFocus, CdkTrapFocus],
  host: { class: 'm36-a11y' },
  template: `
    <h1>Section 9: CDK accessibility</h1>

    <section>
      <h2>Focus origin</h2>
      <button class="m36-a11y-button" type="button">Before the monitored button</button>
      <button class="m36-a11y-button m36-a11y-ring" type="button" cdkMonitorElementFocus (cdkFocusChange)="origin.set($event)">
        Monitored button
      </button>
      <output aria-label="Focus origin">Origin: {{ origin() ?? 'none' }}</output>
    </section>

    <section>
      <h2>Focus trap</h2>
      <button class="m36-a11y-button" type="button">Outside before</button>
      <div cdkTrapFocus class="m36-a11y-trap" role="group" aria-label="Trapped region">
        <button class="m36-a11y-button" type="button">Trap first</button>
        <button class="m36-a11y-button" type="button">Trap last</button>
      </div>
      <button class="m36-a11y-button" type="button">Outside after</button>
    </section>

    <section>
      <h2>Live announcer</h2>
      <button class="m36-a11y-button" type="button" (click)="announce()">Announce results</button>
    </section>
  `,
})
export class LabM36A11y {
  private readonly announcer = inject(LiveAnnouncer);

  /** The origin the monitored button last reported: `null` after a blur. */
  protected readonly origin = signal<FocusOrigin>(null);

  /** Writes one message into the announcer's single live element (the write itself is delayed). */
  protected announce(): void {
    void this.announcer.announce('3 results found');
  }
}
