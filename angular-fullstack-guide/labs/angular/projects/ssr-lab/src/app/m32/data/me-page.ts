import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { LabProduct } from './product';
import { browserStable } from './stable';

/** A fixed lab value, not a credential: any request that carries an `Authorization` header skips the transfer cache. */
const LAB_AUTHORIZATION = 'Bearer lab-demo-token';

/** Loads the catalog with an `Authorization` header, as a signed-in page would. */
@Component({
  selector: 'lab-m32-data-me',
  template: `
    <h2>Data: signed-in catalog</h2>
    <ul aria-label="Products">
      @for (product of products(); track product.id) {
        <li>{{ product.name }}</li>
      }
    </ul>
    <p>Stable: <output aria-label="Stable">{{ stable() ? 'yes' : 'no' }}</output></p>
  `,
})
export class LabM32DataMe {
  protected readonly products = toSignal(
    inject(HttpClient).get<LabProduct[]>('/api/catalog', { headers: new HttpHeaders({ Authorization: LAB_AUTHORIZATION }) }),
    { initialValue: [] },
  );
  protected readonly stable = browserStable();
}
