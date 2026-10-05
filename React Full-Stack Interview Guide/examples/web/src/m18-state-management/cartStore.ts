import { create } from 'zustand';
import type { CartLine } from './cartSlice';
import type { Product } from './products';

export type CartStore = {
  lines: CartLine[];
  coupon: string | null;
  add: (product: Product) => void;
  setQuantity: (id: string, quantity: number) => void;
  remove: (id: string) => void;
  applyCoupon: (coupon: string | null) => void;
  clear: () => void;
};

/**
 * The same cart as `cartSlice`, as a Zustand store. State and actions live in one object;
 * there is no Provider, no action objects and no reducer: actions call `set` directly.
 * `set` shallow-merges the object you return into the state, so updates must be immutable
 * (no Immer here unless you add the `immer` middleware).
 */
export const useCartStore = create<CartStore>()((set) => ({
  lines: [],
  coupon: null,
  add: (product) =>
    set((state) => {
      if (!state.lines.some((l) => l.id === product.id)) {
        return { lines: [...state.lines, { ...product, quantity: 1 }] };
      }
      return { lines: state.lines.map((l) => (l.id === product.id ? { ...l, quantity: l.quantity + 1 } : l)) };
    }),
  setQuantity: (id, quantity) =>
    set((state) => {
      if (quantity <= 0) return { lines: state.lines.filter((l) => l.id !== id) };
      return { lines: state.lines.map((l) => (l.id === id ? { ...l, quantity } : l)) };
    }),
  remove: (id) => set((state) => ({ lines: state.lines.filter((l) => l.id !== id) })),
  applyCoupon: (coupon) => set({ coupon }),
  clear: () => set({ lines: [], coupon: null }),
}));

/** Derived values are plain functions of the state; they return primitives, so no memoization needed. */
export const selectCount = (state: CartStore): number => state.lines.reduce((n, l) => n + l.quantity, 0);
export const selectTotal = (state: CartStore): number =>
  state.lines.reduce((sum, l) => sum + l.price * l.quantity, 0);

/** The store is a module singleton: tests call this in `beforeEach` to start clean. */
export function resetCartStore(): void {
  // `true` replaces the whole state (actions included, which getInitialState also contains).
  useCartStore.setState(useCartStore.getInitialState(), true);
}
