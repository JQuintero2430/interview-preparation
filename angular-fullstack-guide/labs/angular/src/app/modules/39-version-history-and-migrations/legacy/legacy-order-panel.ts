import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { LabM39LegacyOrdersService } from './legacy-orders.service';

export interface LabM39LegacyOrder {
  id: string;
  customer: string;
}

// Legacy on purpose (SYLLABUS §5, module 39 section 10): declared in an NgModule, *ngIf and *ngFor from CommonModule,
// decorator input and output, constructor injection, the async pipe and the deprecated Default strategy.
// migrated/order-panel.ts is the same feature after the migration program.
@Component({
  selector: 'lab-m39-legacy-order-panel',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <ul *ngIf="orders.length; else empty">
      <li *ngFor="let order of orders">
        <button type="button" (click)="choose(order.id)">{{ order.id }} · {{ order.customer }}</button>
      </li>
    </ul>
    <ng-template #empty><p>No orders</p></ng-template>
    <p *ngIf="ordersService.selectedId$ | async as id">Selected {{ id }}</p>
  `,
})
export class LabM39LegacyOrderPanel {
  @Input({ required: true }) orders!: LabM39LegacyOrder[];
  @Output() selected = new EventEmitter<string>();

  constructor(protected readonly ordersService: LabM39LegacyOrdersService) {}

  choose(id: string): void {
    this.ordersService.select(id);
    this.selected.emit(id);
  }
}
