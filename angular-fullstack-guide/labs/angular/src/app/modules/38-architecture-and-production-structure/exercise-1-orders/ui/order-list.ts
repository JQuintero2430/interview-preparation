import { Component, input } from '@angular/core';
import { Order } from '../data-access/orders-api';

/** Presentational: signal input in, markup out, no injected state. */
@Component({
  selector: 'lab-m38-ex1-order-list',
  template: `
    <ul>
      @for (order of orders(); track order.id) {
        <li>{{ order.customer }} ({{ order.status }})</li>
      }
    </ul>
  `,
})
export class LabM38Ex1OrderList {
  readonly orders = input.required<readonly Order[]>();
}
