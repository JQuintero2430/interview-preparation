import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';

/** A "staff only" string: hidden by `@if`, yet shipped to every visitor in the lazy chunk (Section 1). */
export const LAB_M33_PUBLIC_MARKER = 'LAB-M33-STAFF-DISCOUNT-50';

/** What the order API answers: the total it charged, computed from its own price list. */
export interface LabM33OrderResult {
  item: string;
  total: number;
}

@Component({
  selector: 'lab-m33-threat-order',
  template: `
    <h2>Order</h2>
    <p>Book: {{ price }} EUR</p>
    <button type="button" (click)="placeOrder()">Place order</button>
    <p role="status">{{ status() }}</p>
    @if (isStaff()) {
      <p>Staff discount code: {{ staffCode }}</p>
    }
  `,
})
export class LabM33ThreatOrder {
  private readonly http = inject(HttpClient);
  protected readonly price = 25;
  protected readonly staffCode = LAB_M33_PUBLIC_MARKER;
  protected readonly isStaff = signal(false);
  protected readonly status = signal('');

  protected placeOrder(): void {
    // The client sends the price it shows; the server must not believe it.
    this.http
      .post<LabM33OrderResult>('/api/m33/threat/order', { item: 'book', price: this.price })
      .subscribe({
        next: (order) => this.status.set(`Charged ${order.total} EUR`),
        error: () => this.status.set('The order failed. Try again.'),
      });
  }
}
