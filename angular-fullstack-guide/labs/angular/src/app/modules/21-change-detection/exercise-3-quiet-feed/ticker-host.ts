import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { QuietTicker } from './quiet-ticker';

// Eager on purpose: a zone-era consumer with a plain field, which only a zone tick can render.
@Component({
  selector: 'lab-m21-e3-host',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [QuietTicker],
  template: `<lab-m21-e3-quiet (selected)="chosen = $event" /><p class="chosen">{{ chosen }}</p>`,
})
export class TickerHost {
  readonly ticker = viewChild.required(QuietTicker);
  chosen = 0;
}
