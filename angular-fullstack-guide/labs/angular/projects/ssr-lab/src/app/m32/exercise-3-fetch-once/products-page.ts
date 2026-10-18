import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { LabProduct } from '../data/product';
import { browserStable } from '../data/stable';
import { LabM32Ex3SignedIn } from './signed-in';
import { labM32Ex3ServerStamp } from './server-stamp';

/** The solution: `HttpClient` for the products (the transfer cache carries them) and `TransferState` for the stamp. */
@Component({
  selector: 'lab-m32-ex3-products',
  imports: [RouterLink, LabM32Ex3SignedIn],
  template: `
    <h2>Fetch once: products</h2>
    <ul aria-label="Products">
      @for (product of products(); track product.id) {
        <li>{{ product.name }}</li>
      }
    </ul>
    <p>Server stamp: <output aria-label="Server stamp">{{ stamp }}</output></p>
    <lab-m32-ex3-signed-in />
    <p>Stable: <output aria-label="Stable">{{ stable() ? 'yes' : 'no' }}</output></p>
    <a routerLink="../other">Open the other page</a>
  `,
})
export class LabM32Ex3Products {
  protected readonly products = toSignal(inject(HttpClient).get<LabProduct[]>('/api/catalog'), { initialValue: [] });
  protected readonly stamp = labM32Ex3ServerStamp();
  protected readonly stable = browserStable();
}
