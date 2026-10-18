import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';

interface StartOrder {
  readonly id: number;
  readonly customer: string;
  readonly status: string;
}

/** The "before": fetching, state, filtering and markup in one component. Given, not tested. */
@Component({
  selector: 'lab-m38-start-orders-page',
  template: `
    <button type="button" (click)="filter.set('shipped')">Shipped</button>
    <ul>
      @for (order of orders(); track order.id) {
        @if (filter() === null || order.status === filter()) {
          <li>{{ order.customer }}</li>
        }
      }
    </ul>
    @if (failed()) {
      <p>Could not load orders</p>
    }
  `,
})
export class LabM38StartOrdersPage implements OnInit {
  readonly #http = inject(HttpClient);
  protected readonly orders = signal<readonly StartOrder[]>([]);
  protected readonly filter = signal<string | null>(null);
  protected readonly failed = signal(false);

  ngOnInit(): void {
    this.#http.get<StartOrder[]>('/api/orders').subscribe({
      next: (orders) => this.orders.set(orders),
      error: () => this.failed.set(true),
    });
  }
}
