// Legacy: the input of Exercise 22.2, kept unchanged. A public Subject used as an app-wide bus, a store whose
// BehaviorSubject anyone can call next on, and a consumer that completes the shared bus. Compiled by ng build;
// only cart-store.spec.ts runs it, to reproduce its symptoms.
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

export interface LegacyCart {
  items: string[];
  total: number;
}

@Injectable({ providedIn: 'root' })
export class LegacyEventBus {
  readonly events = new Subject<unknown>();
}

@Injectable({ providedIn: 'root' })
export class LegacyCartStore {
  readonly cart = new BehaviorSubject<LegacyCart>({ items: [], total: 0 });

  add(item: string, price: number): void {
    const current = this.cart.value;
    this.cart.next({ items: [...current.items, item], total: current.total + price });
  }
}

@Injectable({ providedIn: 'root' })
export class LegacyCheckoutWidget {
  private readonly bus = inject(LegacyEventBus);

  finish(): void {
    this.bus.events.next('checkout');
    this.bus.events.complete();
  }
}
