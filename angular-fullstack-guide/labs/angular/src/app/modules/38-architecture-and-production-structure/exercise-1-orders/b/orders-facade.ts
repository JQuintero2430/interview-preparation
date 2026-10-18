import { Provider, computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, of, pipe, switchMap, tap } from 'rxjs';
import { ORDERS_API, Order, OrderStatus } from '../data-access/orders-api';
import { LOAD_ERROR_MESSAGE, ORDERS_FACADE } from '../orders-facade.token';

interface OrdersState {
  readonly orders: readonly Order[];
  readonly status: OrderStatus | null;
  readonly error: string | null;
}

/** Variant b: the same public API over an `@ngrx/signals` store; the store instance is the facade. */
export const OrdersFacadeB = signalStore(
  withState<OrdersState>({ orders: [], status: null, error: null }),
  withComputed(({ orders, status }) => ({
    visibleOrders: computed(() => (status() === null ? orders() : orders().filter((order) => order.status === status()))),
  })),
  withMethods((store, api = inject(ORDERS_API)) => ({
    setStatus(status: OrderStatus | null): void {
      patchState(store, { status });
    },
    load: rxMethod<void>(
      pipe(
        switchMap(() =>
          api.list().pipe(
            tap((orders) => patchState(store, { orders, error: null })),
            catchError(() => {
              patchState(store, { error: LOAD_ERROR_MESSAGE });
              return of(null);
            }),
          ),
        ),
      ),
    ),
  })),
);

export function provideOrdersFacadeB(): Provider[] {
  return [OrdersFacadeB, { provide: ORDERS_FACADE, useExisting: OrdersFacadeB }];
}
