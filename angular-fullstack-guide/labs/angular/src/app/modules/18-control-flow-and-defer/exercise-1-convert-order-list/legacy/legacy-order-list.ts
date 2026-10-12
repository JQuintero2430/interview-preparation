import { NgFor, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { Component, input } from '@angular/core';
import { Order } from '../order';

// Legacy: the starting point of Exercise 18.1. Structural directives with explicit imports; leave it unchanged.
@Component({
  selector: 'lab-m18-legacy-order-list',
  imports: [NgFor, NgIf, NgSwitch, NgSwitchCase],
  template: `
    <ng-container *ngIf="orders() as list; else loading">
      <ul>
        <li *ngFor="let order of list; trackBy: byId" [attr.data-id]="order.id">
          {{ order.label }}
          <ng-container [ngSwitch]="order.status">
            <b *ngSwitchCase="'new'" class="badge">New</b>
            <b *ngSwitchCase="'paid'" class="badge">Paid</b>
            <b *ngSwitchCase="'shipped'" class="badge">Shipped</b>
            <b *ngSwitchCase="'lost'" class="badge">Lost</b>
          </ng-container>
        </li>
        <li *ngIf="list.length === 0" class="empty">No orders yet</li>
      </ul>
    </ng-container>
    <ng-template #loading><p>Loading orders</p></ng-template>
  `,
})
export class LegacyOrderList {
  readonly orders = input<readonly Order[] | null>(null);

  protected byId(_index: number, order: Order): number {
    return order.id;
  }
}
