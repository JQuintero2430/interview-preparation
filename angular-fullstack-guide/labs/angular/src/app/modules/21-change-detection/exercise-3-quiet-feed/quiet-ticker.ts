import { Component, DestroyRef, inject, NgZone, output, signal } from '@angular/core';
import { PriceFeed } from './price-feed';

export const PUBLISH_MS = 25;

@Component({
  selector: 'lab-m21-e3-quiet',
  template: `{{ tpl() }}<span class="price">{{ price() }}</span>`,
})
export class QuietTicker {
  private readonly feed = inject(PriceFeed);
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  private latest = 0;
  private published = 0;
  readonly price = signal(0);
  readonly selected = output<number>();
  renders = 0;

  constructor() {
    this.zone.runOutsideAngular(() => this.start());
  }

  // Called by code that runs outside the zone, such as a third-party widget's callback.
  pick(): void {
    this.zone.run(() => this.selected.emit(this.price()));
  }

  protected tpl(): string {
    this.renders += 1;
    return '';
  }

  private start(): void {
    const stop = this.feed.subscribe((value) => (this.latest = value));
    const id = setInterval(() => this.publish(), PUBLISH_MS);
    this.destroyRef.onDestroy(() => {
      stop();
      clearInterval(id);
    });
  }

  private publish(): void {
    if (this.latest !== this.published) {
      this.published = this.latest;
      this.price.set(this.latest);
    }
  }
}
