import { Component, inject } from '@angular/core';
import { OrdersFacadePort } from '../data-access/orders-facade';
import { LabM38OrderList } from '../ui/order-list';

/** Container: reads the facade's signals, passes them down, turns outputs into facade calls. */
@Component({
  selector: 'lab-m38-orders-page',
  imports: [LabM38OrderList],
  template: `<lab-m38-order-list [orders]="facade.orders()" (select)="facade.select($event)" />`,
})
export class LabM38OrdersPage {
  protected readonly facade = inject(OrdersFacadePort);
}
