import {
  cartItemCount,
  cartReducer,
  cartTotalCents,
  emptyCart,
  type CartAction,
  type CartState,
  type Product,
} from './cartReducer';

const apple: Product = { id: 'apple', name: 'Apple', priceCents: 50 };
const pear: Product = { id: 'pear', name: 'Pear', priceCents: 75 };

// Freezing proves immutability: in an ES module (strict mode) any write to a frozen object throws.
function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === 'object') {
    Object.values(value).forEach((child) => deepFreeze(child));
    Object.freeze(value);
  }
  return value;
}

const run = (actions: CartAction[], start: CartState = emptyCart) =>
  actions.reduce(cartReducer, start);

test('adding an existing product copies only the changed line (structural sharing)', () => {
  const before = deepFreeze(
    run([
      { type: 'added', product: apple },
      { type: 'added', product: pear },
    ]),
  );
  const after = cartReducer(before, { type: 'added', product: apple });

  expect(after).not.toBe(before);
  expect(after.lines).not.toBe(before.lines);
  expect(after.lines[0]).toEqual({ product: apple, quantity: 2 });
  expect(after.lines[1]).toBe(before.lines[1]); // untouched line is the same object
  expect(before.lines[0]?.quantity).toBe(1); // the old snapshot is unchanged
});

test('decrementing to zero removes the line', () => {
  const state = deepFreeze(run([{ type: 'added', product: apple }]));
  expect(cartReducer(state, { type: 'decremented', productId: 'apple' }).lines).toEqual([]);
});

test('an action that changes nothing returns the same reference', () => {
  const state = deepFreeze(run([{ type: 'added', product: apple }]));
  expect(cartReducer(state, { type: 'removed', productId: 'kiwi' })).toBe(state);
  expect(cartReducer(state, { type: 'decremented', productId: 'kiwi' })).toBe(state);
});

test('cleared returns the empty cart', () => {
  const state = deepFreeze(run([{ type: 'added', product: pear }]));
  expect(cartReducer(state, { type: 'cleared' })).toBe(emptyCart);
});

test('total and item count are derived from the lines', () => {
  const state = run([
    { type: 'added', product: apple },
    { type: 'added', product: apple },
    { type: 'added', product: pear },
  ]);
  expect(cartTotalCents(state)).toBe(175);
  expect(cartItemCount(state)).toBe(3);
});
