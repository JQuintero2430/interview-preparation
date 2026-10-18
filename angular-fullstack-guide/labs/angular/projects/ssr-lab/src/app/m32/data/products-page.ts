import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { LabProduct } from './product';
import { browserStable } from './stable';

/** Loads the catalog with `HttpClient`: the server's response travels to the browser in the state script. */
@Component({
  selector: 'lab-m32-data-products',
  imports: [RouterLink],
  template: `
    <h2>Data: products</h2>
    <ul aria-label="Products">
      @for (product of products(); track product.id) {
        <li>{{ product.name }}</li>
      }
    </ul>
    <p>Stable: <output aria-label="Stable">{{ stable() ? 'yes' : 'no' }}</output></p>
    <a routerLink="/m32/data/products-again">Open the list again</a>
  `,
})
export class LabM32DataProducts {
  protected readonly products = toSignal(inject(HttpClient).get<LabProduct[]>('/api/catalog'), { initialValue: [] });
  protected readonly stable = browserStable();
}
