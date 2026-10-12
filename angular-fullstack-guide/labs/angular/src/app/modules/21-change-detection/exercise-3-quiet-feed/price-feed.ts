import { Injectable } from '@angular/core';

export const FEED_EVERY_MS = 2;

// A fake feed. Its timer starts with the first subscriber, so, like a socket opened on subscribe,
// it ticks in the zone that was current at that moment.
@Injectable({ providedIn: 'root' })
export class PriceFeed {
  private readonly listeners = new Set<(price: number) => void>();
  private timer: ReturnType<typeof setInterval> | undefined;
  last = 0;

  get subscribers(): number {
    return this.listeners.size;
  }

  get running(): boolean {
    return this.timer !== undefined;
  }

  subscribe(listener: (price: number) => void): () => void {
    this.listeners.add(listener);
    this.timer ??= setInterval(() => this.emit(this.last + 1), FEED_EVERY_MS);
    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) {
        this.stop();
      }
    };
  }

  emit(price: number): void {
    this.last = price;
    this.listeners.forEach((listener) => listener(price));
  }

  stop(): void {
    clearInterval(this.timer);
    this.timer = undefined;
  }
}
