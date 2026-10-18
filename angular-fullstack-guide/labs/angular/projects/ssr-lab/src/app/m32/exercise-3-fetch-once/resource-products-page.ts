import { httpResource } from '@angular/common/http';
import { Component, resource } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LabProduct } from '../data/product';
import { browserStable } from '../data/stable';
import { LabM32Ex3SignedIn } from './signed-in';

/** The alternative: `httpResource` for the products and a `resource` with an `id` for the stamp. */
@Component({
  selector: 'lab-m32-ex3-resource-products',
  imports: [RouterLink, LabM32Ex3SignedIn],
  template: `
    <h2>Fetch once: products</h2>
    <ul aria-label="Products">
      @for (product of products.value(); track product.id) {
        <li>{{ product.name }}</li>
      }
    </ul>
    <p>Server stamp: <output aria-label="Server stamp">{{ stamp.value() ?? 'loading' }}</output></p>
    <lab-m32-ex3-signed-in />
    <p>Stable: <output aria-label="Stable">{{ stable() ? 'yes' : 'no' }}</output></p>
    <a routerLink="../other">Open the other page</a>
  `,
})
export class LabM32Ex3ResourceProducts {
  protected readonly products = httpResource<LabProduct[]>(() => '/api/catalog', { defaultValue: [] });
  protected readonly stamp = resource({ id: 'lab-m32-ex3-stamp', loader: async () => crypto.randomUUID() });
  protected readonly stable = browserStable();
}
