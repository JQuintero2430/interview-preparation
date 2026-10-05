import {
  selectCartSummary,
  selectCartSummaryUnmemoized,
  selectDiscountedTotal,
  selectLinesAtLeast,
} from './cartSelectors';
import { couponApplied, itemAdded, type CartState } from './cartSlice';
import { CABLE, KEYBOARD, MOUSE } from './products';
import { makeStore } from './store';

// Selectors are module-level singletons with their own cache, so reset the counters per test.
beforeEach(() => {
  selectCartSummary.resetRecomputations();
  selectLinesAtLeast.resetRecomputations();
});

const cart = (lines: CartState['lines'], coupon: string | null = null) => ({ cart: { lines, coupon } });

test('the unmemoized selector returns an equal but new object every call', () => {
  const state = cart([{ ...KEYBOARD, quantity: 2 }]);
  const a = selectCartSummaryUnmemoized(state);
  const b = selectCartSummaryUnmemoized(state);
  expect(b).toEqual(a);
  expect(b).not.toBe(a);
});

test('same state: the memoized selector returns the same object and computes once', () => {
  const state = cart([{ ...KEYBOARD, quantity: 2 }]);
  const a = selectCartSummary(state);
  const b = selectCartSummary(state);
  expect(a).toEqual({ count: 2, total: 9998 });
  expect(b).toBe(a);
  expect(selectCartSummary.recomputations()).toBe(1);
});

test('an unrelated change (the coupon) keeps the reference; a cart change replaces it', () => {
  const store = makeStore();
  store.dispatch(itemAdded(KEYBOARD));
  const first = selectCartSummary(store.getState());

  store.dispatch(couponApplied('SAVE10'));
  expect(selectCartSummary(store.getState())).toBe(first);
  expect(selectDiscountedTotal(store.getState())).toBe(4499);

  store.dispatch(itemAdded(MOUSE));
  const second = selectCartSummary(store.getState());
  expect(second).not.toBe(first);
  expect(second).toEqual({ count: 2, total: 6998 });
  expect(selectCartSummary.recomputations()).toBe(2);
});

test('weakMapMemoize keeps more than one entry: alternating inputs do not recompute', () => {
  const a = cart([{ ...KEYBOARD, quantity: 1 }]);
  const b = cart([{ ...MOUSE, quantity: 1 }]);
  const first = selectCartSummary(a);
  selectCartSummary(b);
  expect(selectCartSummary(a)).toBe(first);
  expect(selectCartSummary.recomputations()).toBe(2); // with a cache size of 1 (lruMemoize default) it would be 3
});

test('a selector with an argument is stable per (state, argument) pair', () => {
  const state = cart([
    { ...KEYBOARD, quantity: 1 },
    { ...MOUSE, quantity: 1 },
    { ...CABLE, quantity: 3 },
  ]);
  const expensive = selectLinesAtLeast(state, 1000);
  const cheap = selectLinesAtLeast(state, 0);

  expect(expensive.map((l) => l.id)).toEqual(['kb', 'mouse']);
  expect(cheap).toHaveLength(3);
  expect(selectLinesAtLeast(state, 1000)).toBe(expensive);
  expect(selectLinesAtLeast(state, 0)).toBe(cheap);
  expect(selectLinesAtLeast.recomputations()).toBe(2);
});
