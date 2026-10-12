import { Component, input } from '@angular/core';
import { Order } from './order';

@Component({
  selector: 'lab-m18-order-list',
  templateUrl: './order-list.html',
})
export class OrderList {
  readonly orders = input<readonly Order[] | null>(null);
}
