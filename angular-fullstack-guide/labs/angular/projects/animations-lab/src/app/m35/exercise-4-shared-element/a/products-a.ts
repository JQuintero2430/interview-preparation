import { Component, Injectable, inject, signal } from '@angular/core';
import { LabM35Ex4List } from '../list';
import { transitionName } from '../products';

/** The last product clicked. Root-provided, so it outlives the list and names the card again on the way back. */
@Injectable({ providedIn: 'root' })
export class LabM35Ex4Selection {
  readonly id = signal<number | null>(null);
}

// Exercise 35.4, variant a: the click stores the product id before the router starts the transition, and only that
// card carries the name.
@Component({
  selector: 'lab-m35-ex4-products-a',
  imports: [LabM35Ex4List],
  template: `
    <lab-m35-ex4-list
      variant="a"
      base="/m35/ex4/a"
      [nameOf]="nameOf"
      (picked)="selection.id.set($event)"
    />
  `,
})
export class LabM35Ex4ProductsA {
  protected readonly selection = inject(LabM35Ex4Selection);
  protected readonly nameOf = (id: number): string | null =>
    this.selection.id() === id ? transitionName(id) : null;
}
