import { Component, DestroyRef, inject, signal } from '@angular/core';
import { PriceFeed } from '../price-feed';

// Legacy: the zone-era ticker of Exercise 21.3 (module 21), read-only. It subscribes inside the
// zone, so the feed's timer runs in the Angular zone and every emission ends in a tick.
@Component({
  selector: 'lab-m21-e3-noisy',
  template: `{{ tpl() }}<span class="price">{{ price() }}</span>`,
})
export class NoisyTicker {
  readonly price = signal(0);
  renders = 0;

  constructor() {
    const stop = inject(PriceFeed).subscribe((value) => this.price.set(value));
    inject(DestroyRef).onDestroy(stop);
  }

  protected tpl(): string {
    this.renders += 1;
    return '';
  }
}
