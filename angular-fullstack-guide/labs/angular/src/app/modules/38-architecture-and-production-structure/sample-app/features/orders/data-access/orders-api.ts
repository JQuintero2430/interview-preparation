import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, InjectionToken, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';

const ORDERS_URL = '/api/orders';

/** The shape the server sends (DTO). */
interface OrderDto {
  readonly order_id: number;
  readonly customer_name: string;
}

/** The shape the screens use (view model). */
export interface Order {
  readonly id: number;
  readonly customer: string;
}

export type OrdersError = { readonly kind: 'offline' } | { readonly kind: 'server'; readonly status: number };

/** The port: what the facade needs from any orders source. `list()` fails only with an `OrdersError`. */
export interface OrdersApi {
  list(): Observable<readonly Order[]>;
}

export const ORDERS_API = new InjectionToken<OrdersApi>('lab-m38-orders-api');

/** Turns any failure into the one error type the feature knows; status 0 means no response reached the app. */
export function toOrdersError(err: unknown): OrdersError {
  if (err instanceof HttpErrorResponse && err.status === 0) return { kind: 'offline' };
  return { kind: 'server', status: err instanceof HttpErrorResponse ? err.status : -1 };
}

/** The HTTP adapter: maps DTOs to view models and errors to `OrdersError`, once, at the edge. */
@Injectable()
export class HttpOrdersApi implements OrdersApi {
  readonly #http = inject(HttpClient);

  list(): Observable<readonly Order[]> {
    return this.#http.get<OrderDto[]>(ORDERS_URL).pipe(
      map((dtos) => dtos.map((dto) => ({ id: dto.order_id, customer: dto.customer_name }))),
      catchError((err: unknown) => throwError(() => toOrdersError(err))),
    );
  }
}
