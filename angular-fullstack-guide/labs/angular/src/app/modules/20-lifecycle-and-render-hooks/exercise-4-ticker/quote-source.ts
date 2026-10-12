import { Injectable } from '@angular/core';

/** A fake quote service: every request waits until the spec answers it. */
@Injectable({ providedIn: 'root' })
export class QuoteSource {
  readonly pending: ((price: number) => void)[] = [];

  next(): Promise<number> {
    return new Promise((resolve) => this.pending.push(resolve));
  }

  answerOldest(price: number): void {
    this.pending.shift()?.(price);
  }
}
