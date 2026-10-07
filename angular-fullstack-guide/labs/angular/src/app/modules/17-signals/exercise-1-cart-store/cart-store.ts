// labs/angular/src/app/modules/17-signals/exercise-1-cart-store/cart-store.ts
import { computed, Service, signal } from '@angular/core';

export interface Product {
  readonly id: string;
  readonly name: string;
  /** Price in cents: integers avoid floating-point rounding errors with money. */
  readonly priceCents: number;
}

export interface CartLine {
  readonly product: Product;
  readonly quantity: number;
}

@Service()
export class CartStore {
  // The only writable state. Private, so every change goes through a named method.
  readonly #lines = signal<readonly CartLine[]>([]);

  // Public, read-only view of the same state.
  readonly lines = this.#lines.asReadonly();

  // Derived state: recomputed lazily, and only when #lines changes.
  readonly itemCount = computed(() => this.#lines().reduce((sum, line) => sum + line.quantity, 0));
  readonly totalCents = computed(() =>
    this.#lines().reduce((sum, line) => sum + line.quantity * line.product.priceCents, 0),
  );
  readonly isEmpty = computed(() => this.#lines().length === 0);

  add(product: Product): void {
    const existing = this.#lines().find((line) => line.product.id === product.id);
    if (existing) {
      this.setQuantity(product.id, existing.quantity + 1);
      return;
    }
    this.#lines.update((lines) => [...lines, { product, quantity: 1 }]);
  }

  setQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.remove(productId);
      return;
    }
    this.#lines.update((lines) =>
      lines.map((line) => (line.product.id === productId ? { ...line, quantity } : line)),
    );
  }

  remove(productId: string): void {
    this.#lines.update((lines) => lines.filter((line) => line.product.id !== productId));
  }

  clear(): void {
    this.#lines.set([]);
  }
}
