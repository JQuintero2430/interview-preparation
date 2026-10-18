import { InjectionToken, Signal } from '@angular/core';
import { Order, OrderStatus } from './data-access/orders-api';

/** The public API both facade variants implement; the container sees only this. */
export interface OrdersFacade {
  /** Orders matching the current filter. */
  readonly visibleOrders: Signal<readonly Order[]>;
  readonly status: Signal<OrderStatus | null>;
  readonly error: Signal<string | null>;
  load(): void;
  setStatus(status: OrderStatus | null): void;
}

export const ORDERS_FACADE = new InjectionToken<OrdersFacade>('lab-m38-ex1-orders-facade');

export const LOAD_ERROR_MESSAGE = 'Could not load orders';
