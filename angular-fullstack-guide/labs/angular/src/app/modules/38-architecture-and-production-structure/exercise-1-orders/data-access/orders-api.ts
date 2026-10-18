import { HttpClient } from '@angular/common/http';
import { Injectable, InjectionToken, inject } from '@angular/core';
import { Observable } from 'rxjs';

export type OrderStatus = 'open' | 'shipped';

export interface Order {
  readonly id: number;
  readonly customer: string;
  readonly status: OrderStatus;
}

/** The port: the only thing the facades know about where orders come from. */
export interface OrdersApi {
  list(): Observable<readonly Order[]>;
}

export const ORDERS_API = new InjectionToken<OrdersApi>('lab-m38-ex1-orders-api');

/** The HTTP adapter; a test swaps it by providing another value for `ORDERS_API`. */
@Injectable()
export class HttpOrdersApi implements OrdersApi {
  readonly #http = inject(HttpClient);

  list(): Observable<readonly Order[]> {
    return this.#http.get<readonly Order[]>('/api/orders');
  }
}
