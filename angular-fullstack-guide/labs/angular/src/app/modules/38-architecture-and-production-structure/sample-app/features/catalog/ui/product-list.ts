import { Component, input } from '@angular/core';

/** The row this component needs; ui declares its own shape instead of importing data-access. */
export interface ProductRow {
  readonly id: number;
  readonly name: string;
}

/** Presentational: inputs in, no injected services. */
@Component({
  selector: 'lab-m38-product-list',
  template: `
    <ul>
      @for (product of products(); track product.id) {
        <li>{{ product.name }}</li>
      }
    </ul>
  `,
})
export class LabM38ProductList {
  readonly products = input.required<readonly ProductRow[]>();
}
