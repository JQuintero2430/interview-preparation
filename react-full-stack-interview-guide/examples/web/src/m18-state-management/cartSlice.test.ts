import {
  cartReducer,
  cartSlice,
  cleared,
  couponApplied,
  initialCartState,
  itemAdded,
  itemRemoved,
  quantityChanged,
  type CartState,
} from './cartSlice';
import { placeOrder } from './checkout';
import { KEYBOARD, MOUSE } from './products';

// The reducer is a pure function: (state, action) => state. No store, no React.

test('action creators build { type: "slice/caseName", payload }', () => {
  expect(itemAdded(KEYBOARD)).toEqual({ type: 'cart/itemAdded', payload: KEYBOARD });
  expect(itemAdded.type).toBe('cart/itemAdded');
  expect(itemAdded.match({ type: 'cart/itemAdded', payload: KEYBOARD })).toBe(true);
});

test('an unknown action returns the initial state', () => {
  expect(cartReducer(undefined, { type: 'unknown' })).toEqual(initialCartState);
});

test('itemAdded twice merges into one line and never mutates the input', () => {
  const once = cartReducer(initialCartState, itemAdded(KEYBOARD));
  const twice = cartReducer(once, itemAdded(KEYBOARD));

  expect(twice.lines).toEqual([{ ...KEYBOARD, quantity: 2 }]);
  expect(once.lines[0]?.quantity).toBe(1); // the previous state is untouched
  expect(initialCartState.lines).toEqual([]);
});

test('Immer shares untouched branches and freezes the result', () => {
  const one = cartReducer(initialCartState, itemAdded(KEYBOARD));
  const two = cartReducer(one, itemAdded(MOUSE));

  expect(two.lines[0]).toBe(one.lines[0]); // the keyboard line was not copied
  expect(Object.isFrozen(two)).toBe(true);
  expect(Object.isFrozen(two.lines[0])).toBe(true);
});

test('quantityChanged sets a quantity, and 0 removes the line', () => {
  const state: CartState = { lines: [{ ...KEYBOARD, quantity: 1 }, { ...MOUSE, quantity: 2 }], coupon: null };

  expect(cartReducer(state, quantityChanged({ id: 'mouse', quantity: 5 })).lines[1]?.quantity).toBe(5);
  expect(cartReducer(state, quantityChanged({ id: 'mouse', quantity: 0 })).lines).toEqual([{ ...KEYBOARD, quantity: 1 }]);
});

test('itemRemoved and cleared', () => {
  const state: CartState = { lines: [{ ...KEYBOARD, quantity: 1 }], coupon: 'SAVE10' };
  expect(cartReducer(state, itemRemoved('kb')).lines).toEqual([]);
  expect(cartReducer(state, cleared())).toEqual(initialCartState);
});

test('couponApplied keeps the lines array by reference', () => {
  const state = cartReducer(initialCartState, itemAdded(KEYBOARD));
  const next = cartReducer(state, couponApplied('SAVE10'));
  expect(next.coupon).toBe('SAVE10');
  expect(next.lines).toBe(state.lines);
});

test('extraReducers: a successful order empties the cart', () => {
  const state = cartReducer(initialCartState, itemAdded(KEYBOARD));
  const action = placeOrder.fulfilled({ orderId: 'o-1', total: 4999 }, 'request-1', undefined);
  expect(cartReducer(state, action)).toEqual(initialCartState);
});

test('slice selectors receive the root state shape { cart }', () => {
  const state = cartReducer(initialCartState, itemAdded(MOUSE));
  expect(cartSlice.selectors.selectLineCount({ cart: state })).toBe(1);
});
