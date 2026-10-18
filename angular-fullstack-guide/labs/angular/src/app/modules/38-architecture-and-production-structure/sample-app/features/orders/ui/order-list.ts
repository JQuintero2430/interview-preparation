import { Component, input, output } from '@angular/core';

export interface OrderRow {
  readonly id: number;
  readonly customer: string;
}

/** Presentational: inputs in, outputs out, no injected services. */
@Component({
  selector: 'lab-m38-order-list',
  template: `
    <ul>
      @for (order of orders(); track order.id) {
        <li><button type="button" (click)="select.emit(order.id)">{{ order.customer }}</button></li>
      }
    </ul>
  `,
})
export class LabM38OrderList {
  readonly orders = input.required<readonly OrderRow[]>();
  readonly select = output<number>();
}
