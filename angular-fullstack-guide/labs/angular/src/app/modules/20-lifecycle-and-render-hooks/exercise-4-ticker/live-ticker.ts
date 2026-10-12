import {
  Component,
  DestroyRef,
  afterNextRender,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { injectInterval } from './inject-interval';
import { QuoteSource } from './quote-source';

@Component({ selector: 'lab-m20-live-ticker', template: `{{ price() ?? 'waiting' }}` })
export class LiveTicker {
  readonly active = input(false);
  readonly price = signal<number | undefined>(undefined);

  private readonly source = inject(QuoteSource);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    const ticks = injectInterval(1000, this.active);
    effect(() => {
      if (ticks() > 0) {
        untracked(() => this.refresh());
      }
    });
    afterNextRender(() => {
      if (this.active()) {
        this.refresh();
      }
    });
    const onOnline = () => this.refresh();
    window.addEventListener('online', onOnline);
    this.destroyRef.onDestroy(() => window.removeEventListener('online', onOnline));
  }

  private refresh(): void {
    void this.source.next().then((price) => {
      if (!this.destroyRef.destroyed) {
        this.price.set(price);
      }
    });
  }
}
