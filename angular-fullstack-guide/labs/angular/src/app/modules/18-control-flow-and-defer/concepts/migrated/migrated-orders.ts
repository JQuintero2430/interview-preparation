import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { Component, signal } from '@angular/core';
import { of } from 'rxjs';

export interface MigratedOrder {
  readonly id: number;
  readonly label: string;
  readonly status: 'new' | 'shipped' | 'lost';
}

// Migrated: the output of ng generate @angular/core:control-flow on legacy/migration-sample/legacy-orders.ts, renamed.
@Component({
  selector: 'lab-m18-migrated-orders',
  imports: [AsyncPipe, NgTemplateOutlet],
  templateUrl: './migrated-orders.html',
})
export class MigratedOrders {
  readonly user = signal<string | null>('Ann');
  readonly orders = signal<MigratedOrder[]>([
    { id: 1, label: 'tea', status: 'new' },
    { id: 2, label: 'cake', status: 'shipped' },
    { id: 3, label: 'jam', status: 'lost' },
  ]);
  readonly tags = signal(['a', 'b']);
  readonly state$ = of('open');

  protected byId(_index: number, order: MigratedOrder): number {
    return order.id;
  }
}
