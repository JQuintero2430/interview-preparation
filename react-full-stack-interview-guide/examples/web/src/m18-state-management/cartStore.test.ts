import { resetCartStore, selectCount, selectTotal, useCartStore } from './cartStore';
import { KEYBOARD, MOUSE } from './products';

// One module-level store: reset it before every test so no state leaks between tests.
beforeEach(() => resetCartStore());

const actions = () => useCartStore.getState();

test('starts empty (the reset worked)', () => {
  expect(useCartStore.getState().lines).toEqual([]);
  expect(useCartStore.getState().coupon).toBeNull();
});

test('add merges by id; setQuantity 0 removes; remove and clear', () => {
  actions().add(KEYBOARD);
  actions().add(KEYBOARD);
  actions().add(MOUSE);
  expect(useCartStore.getState().lines).toEqual([
    { ...KEYBOARD, quantity: 2 },
    { ...MOUSE, quantity: 1 },
  ]);

  actions().setQuantity('kb', 0);
  expect(useCartStore.getState().lines).toEqual([{ ...MOUSE, quantity: 1 }]);

  actions().applyCoupon('SAVE10');
  actions().remove('mouse');
  expect(useCartStore.getState().lines).toEqual([]);
  expect(useCartStore.getState().coupon).toBe('SAVE10');

  actions().clear();
  expect(useCartStore.getState().coupon).toBeNull();
});

test('updates are immutable: an old snapshot is never changed', () => {
  actions().add(KEYBOARD);
  const before = useCartStore.getState();
  actions().add(KEYBOARD);
  const after = useCartStore.getState();

  expect(after).not.toBe(before);
  expect(before.lines[0]?.quantity).toBe(1);
  expect(after.add).toBe(before.add); // set merges, so the actions are carried over unchanged
});

test('derived selectors', () => {
  actions().add(KEYBOARD);
  actions().add(MOUSE);
  actions().add(MOUSE);
  expect(selectCount(useCartStore.getState())).toBe(3);
  expect(selectTotal(useCartStore.getState())).toBe(8997);
});

test('subscribe works outside React (the vanilla store API)', () => {
  const counts: number[] = [];
  const unsubscribe = useCartStore.subscribe((state) => counts.push(selectCount(state)));
  actions().add(KEYBOARD);
  actions().add(KEYBOARD);
  unsubscribe();
  actions().add(KEYBOARD);
  expect(counts).toEqual([1, 2]);
});
