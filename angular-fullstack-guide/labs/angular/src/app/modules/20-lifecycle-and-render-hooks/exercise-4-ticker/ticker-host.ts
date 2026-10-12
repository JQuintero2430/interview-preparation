import { Component, signal } from '@angular/core';
import { LiveTicker } from './live-ticker';

@Component({
  selector: 'lab-m20-ticker-host',
  imports: [LiveTicker],
  template: `
    @if (shown()) {
      <lab-m20-live-ticker [active]="active()" />
    }
  `,
})
export class TickerHost {
  readonly shown = signal(true);
  readonly active = signal(true);
}
