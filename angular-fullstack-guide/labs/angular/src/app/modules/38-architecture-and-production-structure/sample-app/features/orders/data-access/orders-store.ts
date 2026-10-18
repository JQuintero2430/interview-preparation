import { Injectable, computed, signal } from '@angular/core';
import { Order, OrdersError } from './orders-api';

interface OrdersState {
  readonly orders: readonly Order[];
  readonly loading: boolean;
  readonly error: OrdersError | null;
  readonly selectedId: number | null;
}

/** A service-with-signals store: private state, read-only selectors, methods as the only writers. */
@Injectable()
export class OrdersStore {
  readonly #state = signal<OrdersState>({ orders: [], loading: false, error: null, selectedId: null });

  readonly orders = computed(() => this.#state().orders);
  readonly loading = computed(() => this.#state().loading);
  readonly error = computed(() => this.#state().error);
  readonly selectedId = computed(() => this.#state().selectedId);

  markLoading(): void {
    this.#state.update((state) => ({ ...state, loading: true }));
  }

  setOrders(orders: readonly Order[]): void {
    this.#state.update((state) => ({ ...state, orders, loading: false, error: null }));
  }

  /** Keeps the orders already shown: a failed refresh does not blank the screen. */
  setError(error: OrdersError): void {
    this.#state.update((state) => ({ ...state, loading: false, error }));
  }

  select(id: number): void {
    this.#state.update((state) => ({ ...state, selectedId: id }));
  }
}
