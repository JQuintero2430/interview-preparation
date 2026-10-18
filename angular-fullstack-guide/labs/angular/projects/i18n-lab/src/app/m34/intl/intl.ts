import { Component } from '@angular/core';

/** A fixed instant, so the page prints the same text on every run. */
const INSTANT = new Date('2024-07-08T15:30:00Z');

// Section 2 of module 34: the platform's own formatter, with the time zone passed explicitly.
const SHORT_TIME = new Intl.DateTimeFormat('en-US', { timeStyle: 'short', timeZone: 'UTC' });

@Component({
  selector: 'lab-m34-intl',
  template: `<p data-testid="short-time">{{ shortTime }}</p>`,
})
export class LabM34Intl {
  protected readonly shortTime = SHORT_TIME.format(INSTANT);
}
