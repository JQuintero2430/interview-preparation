import {
  AsyncPipe,
  NgFor,
  NgIf,
  NgSwitch,
  NgSwitchCase,
  NgSwitchDefault,
  NgTemplateOutlet,
} from '@angular/common';
import { Component, signal } from '@angular/core';
import { of } from 'rxjs';

export interface LegacyOrder {
  readonly id: number;
  readonly label: string;
  readonly status: 'new' | 'shipped' | 'lost';
}

// Legacy: structural directives and explicit NgIf, NgFor and NgSwitch imports. SEC-M18-08 runs the schematic on it.
@Component({
  selector: 'lab-m18-legacy-orders',
  imports: [AsyncPipe, NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, NgTemplateOutlet],
  templateUrl: './legacy-orders.html',
})
export class LegacyOrders {
  readonly user = signal<string | null>('Ann');
  readonly orders = signal<LegacyOrder[]>([
    { id: 1, label: 'tea', status: 'new' },
    { id: 2, label: 'cake', status: 'shipped' },
    { id: 3, label: 'jam', status: 'lost' },
  ]);
  readonly tags = signal(['a', 'b']);
  readonly state$ = of('open');

  protected byId(_index: number, order: LegacyOrder): number {
    return order.id;
  }
}
