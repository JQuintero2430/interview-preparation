import { computed } from '@angular/core';
import { addItem, CartAction, openCart, setDiscount } from './actions';
import { CartState, cartReducer, createCartSelectors, initialCart } from './cart';
import { createStore } from './create-store';

const pen = { id: 1, name: 'pen', price: 200, qty: 2 };
const ink = { id: 2, name: 'ink', price: 1000, qty: 1 };

describe('E28.4 a mini store: typed actions, a reducer, memoized selectors and a signal view', () => {
  const create = (freeze = false) =>
    createStore<CartState, CartAction>(cartReducer, initialCart, { freeze });

  it('dispatch applies the reducer and updates the state signal', () => {
    const store = create();

    store.dispatch(addItem(pen));
    store.dispatch(setDiscount(10));

    expect(store.state()).toEqual({ items: [pen], discountPercent: 10 });
    expect(initialCart.items).toEqual([]);
  });

  it('an action the reducer ignores keeps the same state reference', () => {
    const store = create();
    store.dispatch(addItem(pen));
    const before = store.state();

    store.dispatch(openCart());

    expect(store.state()).toBe(before);
    expect(openCart().type).toBe('[Cart Page] Open Cart');
  });

  it("a selector's projector runs only when one of its inputs changes", () => {
    const { selectSubtotal } = createCartSelectors();
    const first: CartState = { items: [pen], discountPercent: 0 };

    expect(selectSubtotal(first)).toBe(400);
    expect(selectSubtotal(first)).toBe(400);
    expect(selectSubtotal({ ...first, discountPercent: 5 })).toBe(400);
    expect(selectSubtotal({ ...first, items: [pen] })).toBe(400);

    expect(selectSubtotal.projectorRuns()).toBe(2);
  });

  it('a selector built from two selectors reuses their results', () => {
    const { selectSubtotal, selectTotal } = createCartSelectors();
    const first: CartState = { items: [pen, ink], discountPercent: 0 };

    expect(selectTotal(first)).toBe(1400);
    expect(selectTotal({ ...first, discountPercent: 50 })).toBe(700);
    expect(selectTotal({ ...first, discountPercent: 50 })).toBe(700);

    expect(selectSubtotal.projectorRuns()).toBe(1);
    expect(selectTotal.projectorRuns()).toBe(2);
  });

  it('with freeze on, mutating the state throws', () => {
    const store = create(true);
    store.dispatch(addItem(pen));

    expect(() => Object.assign(store.state(), { discountPercent: 90 })).toThrow(TypeError);
    expect(() => Object.assign(store.state().items[0], { qty: 99 })).toThrow(TypeError);
    expect(() => Array.prototype.push.call(store.state().items, ink)).toThrow(TypeError);
    expect(store.state().items).toEqual([pen]);
  });

  it('a computed over a selector updates after dispatch', () => {
    const store = create();
    const { selectTotal } = createCartSelectors();
    const total = computed(() => selectTotal(store.state()));
    expect(total()).toBe(0);

    store.dispatch(addItem(pen));
    expect(total()).toBe(400);

    store.dispatch(setDiscount(25));
    expect(total()).toBe(300);
    expect(selectTotal.projectorRuns()).toBe(3);
  });
});
