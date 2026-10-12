import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { StatusPoller } from './status-poller';

/** A widget that shows the latest status; every widget under one dashboard reads the same poller. */
@Component({ selector: 'lab-m23-status-widget', template: `<p>{{ status() }}</p>` })
export class StatusWidget {
  protected readonly status = toSignal(inject(StatusPoller).status$);
}

/** The dashboard provides one poller and shows two widgets; the poller runs only while a widget reads it. */
@Component({
  selector: 'lab-m23-dashboard',
  imports: [StatusWidget],
  providers: [StatusPoller],
  template: `
    @if (showFirst()) {
      <lab-m23-status-widget />
    }
    @if (showSecond()) {
      <lab-m23-status-widget />
    }
  `,
})
export class Dashboard {
  readonly showFirst = signal(true);
  readonly showSecond = signal(true);
}
