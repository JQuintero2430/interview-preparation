import { Component, input, output } from '@angular/core';
import { OrderStatus } from '../data-access/orders-api';

/** Presentational: shows the choices, emits the chosen status (`null` means all). */
@Component({
  selector: 'lab-m38-ex1-order-filter',
  template: `
    <button type="button" (click)="statusChange.emit(null)">All</button>
    @for (status of statuses(); track status) {
      <button type="button" [attr.data-status]="status" [attr.aria-pressed]="status === selected()" (click)="statusChange.emit(status)">
        {{ status }}
      </button>
    }
  `,
})
export class LabM38Ex1OrderFilter {
  readonly statuses = input.required<readonly OrderStatus[]>();
  readonly selected = input<OrderStatus | null>(null);
  readonly statusChange = output<OrderStatus | null>();
}
