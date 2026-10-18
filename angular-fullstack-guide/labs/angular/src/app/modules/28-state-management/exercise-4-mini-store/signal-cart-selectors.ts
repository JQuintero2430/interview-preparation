import { CartState } from './cart';
import { createSignalSelector } from './create-signal-selector';

/**
 * The cart selectors of `createCartSelectors`, memoized by the signal graph of
 * `createSignalSelector` instead of `createSelector`'s `===` comparison.
 * @returns A fresh set of selectors, so each store has its own one-entry memos.
 */
export function createSignalCartSelectors() {
  const selectItems = (state: CartState) => state.items;
  const selectDiscount = (state: CartState) => state.discountPercent;
  const selectSubtotal = createSignalSelector(selectItems, (items) =>
    items.reduce((sum, item) => sum + item.price * item.qty, 0),
  );
  const selectTotal = createSignalSelector(selectSubtotal, selectDiscount, (subtotal, percent) =>
    Math.round((subtotal * (100 - percent)) / 100),
  );
  return { selectItems, selectDiscount, selectSubtotal, selectTotal };
}
