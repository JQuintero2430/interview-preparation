import { Component, OnInit, inject } from '@angular/core';
import { QuoteSource } from '../quote-source';

/**
 * Legacy starting point of Exercise 20.4, kept as it is: the interval starts in the constructor,
 * the `online` listener is never removed and a late quote still writes to the component.
 * `LiveTicker` is the fixed version.
 */
@Component({ selector: 'lab-m20-leaky-ticker', template: `{{ price ?? 'waiting' }}` })
export class LeakyTicker implements OnInit {
  price: number | undefined;
  private readonly source = inject(QuoteSource);

  constructor() {
    setInterval(() => this.refresh(), 1000);
    window.addEventListener('online', () => this.refresh());
  }

  ngOnInit(): void {
    this.refresh();
  }

  private refresh(): void {
    void this.source.next().then((price) => (this.price = price));
  }
}
