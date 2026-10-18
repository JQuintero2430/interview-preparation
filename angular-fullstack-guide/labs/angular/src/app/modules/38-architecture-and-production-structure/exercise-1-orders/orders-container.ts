import { Component, OnInit, inject } from '@angular/core';
import { OrderStatus } from './data-access/orders-api';
import { ORDERS_FACADE } from './orders-facade.token';
import { LabM38Ex1OrderFilter } from './ui/order-filter';
import { LabM38Ex1OrderList } from './ui/order-list';

/** Container: asks the facade to load, passes its signals down, turns outputs into facade calls. */
@Component({
  selector: 'lab-m38-ex1-orders-container',
  imports: [LabM38Ex1OrderFilter, LabM38Ex1OrderList],
  template: `
    <lab-m38-ex1-order-filter [statuses]="statuses" [selected]="facade.status()" (statusChange)="facade.setStatus($event)" />
    <button type="button" data-action="reload" (click)="facade.load()">Reload</button>
    @if (facade.error(); as message) {
      <p role="alert">{{ message }}</p>
    }
    <lab-m38-ex1-order-list [orders]="facade.visibleOrders()" />
  `,
})
export class LabM38Ex1OrdersContainer implements OnInit {
  protected readonly facade = inject(ORDERS_FACADE);
  protected readonly statuses: readonly OrderStatus[] = ['open', 'shipped'];

  ngOnInit(): void {
    this.facade.load();
  }
}
