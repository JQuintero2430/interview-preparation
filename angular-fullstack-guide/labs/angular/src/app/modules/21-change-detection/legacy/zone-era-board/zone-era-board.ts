import { ChangeDetectionStrategy, Component, inject, NgZone } from '@angular/core';
import { first, Observable } from 'rxjs';

// Legacy: the zone-era starting point of section 6 (module 21). Read-only after SEC-M21-06.
// `Eager` is what the v22 `change-detection-eager` migration adds to a component with no strategy.
@Component({
  selector: 'lab-m21-zone-era-board',
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `<p class="open">{{ open }}</p>
    <p class="status">{{ status }}</p>`,
})
export class ZoneEraBoard {
  private readonly zone = inject(NgZone);
  open = 0;
  status = 'loading';

  watch(tickets: Observable<number>): void {
    this.zone.onStable.pipe(first()).subscribe(() => {
      this.status = 'ready';
    });
    tickets.subscribe((count) => {
      this.open = count;
    });
  }
}
