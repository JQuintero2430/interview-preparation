import { Injectable, Provider, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, of, switchMap } from 'rxjs';
import { ORDERS_API, Order, OrderStatus } from '../data-access/orders-api';
import { LOAD_ERROR_MESSAGE, ORDERS_FACADE, OrdersFacade } from '../orders-facade.token';

/** Variant a: a service with private signals; the facade is the store. */
@Injectable()
export class OrdersFacadeA implements OrdersFacade {
  readonly #api = inject(ORDERS_API);
  readonly #orders = signal<readonly Order[]>([]);
  readonly #status = signal<OrderStatus | null>(null);
  readonly #error = signal<string | null>(null);
  readonly #loads = new Subject<void>();

  readonly status = this.#status.asReadonly();
  readonly error = this.#error.asReadonly();
  readonly visibleOrders = computed(() => {
    const status = this.#status();
    return status === null ? this.#orders() : this.#orders().filter((order) => order.status === status);
  });

  constructor() {
    this.#loads
      .pipe(
        switchMap(() =>
          this.#api.list().pipe(
            catchError(() => {
              this.#error.set(LOAD_ERROR_MESSAGE);
              return of(null);
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((orders) => {
        if (orders === null) return;
        this.#orders.set(orders);
        this.#error.set(null);
      });
  }

  load(): void {
    this.#loads.next();
  }

  setStatus(status: OrderStatus | null): void {
    this.#status.set(status);
  }
}

export function provideOrdersFacadeA(): Provider[] {
  return [OrdersFacadeA, { provide: ORDERS_FACADE, useExisting: OrdersFacadeA }];
}
