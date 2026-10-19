import { Component, input } from '@angular/core';

/** A migrated page: the strangler routes of section 9 send `/orders/:id` here. */
@Component({
  selector: 'lab-m39-order-detail-page',
  template: `<h2>Order {{ id() }} (Angular)</h2>`,
})
export class LabM39OrderDetailPage {
  /** Bound from the `:id` route parameter by `withComponentInputBinding()`. */
  readonly id = input.required<string>();
}
