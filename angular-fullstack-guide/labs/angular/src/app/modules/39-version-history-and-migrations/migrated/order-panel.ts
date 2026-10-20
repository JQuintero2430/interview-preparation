import { Component, inject, input, output } from '@angular/core';
import { LabM39OrderSelection } from './order-selection';

export interface LabM39Order {
  readonly id: string;
  readonly customer: string;
}

/** The legacy order panel after the section 10 program: standalone, built-in control flow, signal APIs, inject(). */
@Component({
  selector: 'lab-m39-order-panel',
  template: `
    @if (orders().length) {
      <ul>
        @for (order of orders(); track order.id) {
          <li>
            <button type="button" (click)="choose(order.id)">{{ order.id }} · {{ order.customer }}</button>
          </li>
        }
      </ul>
    } @else {
      <p>No orders</p>
    }
    @if (selection.selectedId(); as id) {
      <p>Selected {{ id }}</p>
    }
  `,
})
export class LabM39OrderPanel {
  readonly orders = input.required<readonly LabM39Order[]>();
  readonly selected = output<string>();
  protected readonly selection = inject(LabM39OrderSelection);

  protected choose(id: string): void {
    this.selection.select(id);
    this.selected.emit(id);
  }
}
