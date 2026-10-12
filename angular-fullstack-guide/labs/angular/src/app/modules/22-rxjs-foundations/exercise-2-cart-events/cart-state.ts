import { DestroyRef, Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject, distinctUntilChanged, map } from 'rxjs';
import { CartEvent, CartEvents } from './cart-events';

export interface Cart {
  readonly items: readonly string[];
  readonly total: number;
}

const EMPTY_CART: Cart = { items: [], total: 0 };
const RECENT_EVENTS = 3;

/** A pure reducer: the next cart from the current one and an event, never a mutation. */
export function applyEvent(cart: Cart, event: CartEvent): Cart {
  if (event.type === 'added') return { items: [...cart.items, event.item], total: cart.total + event.price };
  const index = cart.items.indexOf(event.item);
  if (index < 0) return cart;
  return { items: cart.items.filter((_, i) => i !== index), total: cart.total - event.price };
}

/** Owns the cart: state behind `state$` and `snapshot()`, the last events behind `recent$`. */
@Injectable()
export class CartState {
  private readonly cart = new BehaviorSubject<Cart>(EMPTY_CART);
  private readonly recent = new ReplaySubject<CartEvent>(RECENT_EVENTS);
  readonly state$: Observable<Cart> = this.cart.asObservable();
  readonly recent$: Observable<CartEvent> = this.recent.asObservable();

  constructor() {
    const subscription = inject(CartEvents).events$.subscribe((event) => {
      this.recent.next(event);
      this.cart.next(applyEvent(this.cart.value, event));
    });
    inject(DestroyRef).onDestroy(() => {
      subscription.unsubscribe();
      this.cart.complete();
      this.recent.complete();
    });
  }

  snapshot(): Cart {
    return this.cart.value;
  }

  /** A slice of the cart that emits only when the slice changes (compared with ===). */
  select<R>(project: (cart: Cart) => R): Observable<R> {
    return this.state$.pipe(map(project), distinctUntilChanged());
  }
}
