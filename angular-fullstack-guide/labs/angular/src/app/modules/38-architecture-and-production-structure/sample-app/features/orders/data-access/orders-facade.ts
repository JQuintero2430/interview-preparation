import { Injectable, Provider, Signal, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, map, of, switchMap } from 'rxjs';
import { HttpOrdersApi, ORDERS_API, Order, OrdersError } from './orders-api';
import { OrdersStore } from './orders-store';

/** What a container needs from the orders feature: read-only signals and intent methods. */
export abstract class OrdersFacadePort {
  abstract readonly orders: Signal<readonly Order[]>;
  abstract select(id: number): void;
}

/** The facade: one class in front of the store and the API port; components never see either. */
@Injectable()
export class OrdersFacade extends OrdersFacadePort {
  readonly #api = inject(ORDERS_API);
  readonly #store = inject(OrdersStore);
  readonly #loads = new Subject<void>();

  readonly orders = this.#store.orders;
  readonly loading = this.#store.loading;
  readonly error = this.#store.error;
  readonly selectedId = this.#store.selectedId;

  constructor() {
    super();
    this.#loads
      .pipe(
        switchMap(() =>
          this.#api.list().pipe(
            map((orders) => () => this.#store.setOrders(orders)),
            catchError((error: OrdersError) => of(() => this.#store.setError(error))),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((apply) => apply());
  }

  load(): void {
    this.#store.markLoading();
    this.#loads.next();
  }

  select(id: number): void {
    this.#store.select(id);
  }
}

/** One provider list per feature, for the feature route's `providers` (one instance per lazy feature). */
export function provideOrdersDataAccess(): Provider[] {
  return [
    OrdersStore,
    OrdersFacade,
    { provide: OrdersFacadePort, useExisting: OrdersFacade },
    { provide: ORDERS_API, useClass: HttpOrdersApi },
  ];
}
