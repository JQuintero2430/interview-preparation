import { createSelector } from '@reduxjs/toolkit';
import type { CartLine, CartState } from './cartSlice';

// Selectors take the smallest state shape they need, not RootState: they stay testable with a
// plain object and avoid importing the store (and a type cycle).
type WithCart = { cart: CartState };

export type CartSummary = { count: number; total: number };

/** Input selectors: plain property reads, which return existing references. */
export const selectCartLines = (state: WithCart): CartLine[] => state.cart.lines;
export const selectCoupon = (state: WithCart): string | null => state.cart.coupon;

/**
 * Unmemoized on purpose, for comparison: returns an equal but NEW object on every call,
 * so a `useSelector` using it re-renders after every dispatch.
 */
export function selectCartSummaryUnmemoized(state: WithCart): CartSummary {
  const lines = selectCartLines(state);
  return {
    count: lines.reduce((n, l) => n + l.quantity, 0),
    total: lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
  };
}

/**
 * Memoized: the result function runs only when `lines` changes by reference, so the same
 * object is returned for every state that shares those lines (a coupon change, another slice…).
 */
export const selectCartSummary = createSelector([selectCartLines], (lines): CartSummary => ({
  count: lines.reduce((n, l) => n + l.quantity, 0),
  total: lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
}));

const COUPON_RATES: Record<string, number> = { SAVE10: 0.9 };

/** Composed selector: memoized on the summary object and the coupon string. */
export const selectDiscountedTotal = createSelector([selectCartSummary, selectCoupon], (summary, coupon) =>
  Math.round(summary.total * (coupon ? (COUPON_RATES[coupon] ?? 1) : 1)),
);

/**
 * A selector with an argument: `useAppSelector((s) => selectLinesAtLeast(s, 1000))`.
 * Reselect 5's default `weakMapMemoize` caches every (lines, minPrice) pair it has seen,
 * so components passing different arguments no longer evict each other's cache.
 */
export const selectLinesAtLeast = createSelector(
  [selectCartLines, (_state: WithCart, minPrice: number) => minPrice],
  (lines, minPrice) => lines.filter((l) => l.price >= minPrice),
);
