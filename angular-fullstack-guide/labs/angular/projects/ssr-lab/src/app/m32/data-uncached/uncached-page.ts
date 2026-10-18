import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { LabProduct } from '../data/product';
import { browserStable } from '../data/stable';

/** Loads the catalog like section 8's products page, but opts this one request out of the transfer cache. */
@Component({
  selector: 'lab-m32-data-uncached',
  template: `
    <h2>Data: products, no transfer cache</h2>
    <ul aria-label="Products">
      @for (product of products(); track product.id) {
        <li>{{ product.name }}</li>
      }
    </ul>
    <p>Stable: <output aria-label="Stable">{{ stable() ? 'yes' : 'no' }}</output></p>
  `,
})
export class LabM32DataUncached {
  protected readonly products = toSignal(inject(HttpClient).get<LabProduct[]>('/api/catalog', { transferCache: false }), {
    initialValue: [],
  });
  protected readonly stable = browserStable();
}
