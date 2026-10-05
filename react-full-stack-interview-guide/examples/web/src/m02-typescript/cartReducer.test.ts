import { expectTypeOf } from 'vitest';
import { assertNever } from './assertNever';
import { cartReducer, initialCart, type CartAction } from './cartReducer';

const run = (...actions: CartAction[]) => actions.reduce(cartReducer, initialCart);

describe('cartReducer (runtime)', () => {
  it('adds a new sku with qty 1 and increments an existing one', () => {
    expect(run({ type: 'added', sku: 'a' }).items).toEqual([{ sku: 'a', qty: 1 }]);
    expect(run({ type: 'added', sku: 'a' }, { type: 'added', sku: 'a' }).items).toEqual([{ sku: 'a', qty: 2 }]);
  });

  it('removes a sku, and qtySet <= 0 removes it too', () => {
    expect(run({ type: 'added', sku: 'a' }, { type: 'removed', sku: 'a' }).items).toEqual([]);
    expect(run({ type: 'added', sku: 'a' }, { type: 'qtySet', sku: 'a', qty: 0 }).items).toEqual([]);
  });

  it('only checks out a non-empty cart, and only pays after checkout started', () => {
    expect(run({ type: 'checkoutStarted' }).status).toBe('idle');
    expect(run({ type: 'paid' }).status).toBe('idle');
    const paid = run({ type: 'added', sku: 'a' }, { type: 'checkoutStarted' }, { type: 'paid' });
    expect(paid).toEqual({ items: [], status: 'paid' });
  });

  it('never mutates the previous state', () => {
    const before = run({ type: 'added', sku: 'a' });
    cartReducer(before, { type: 'qtySet', sku: 'a', qty: 5 });
    expect(before.items).toEqual([{ sku: 'a', qty: 1 }]);
  });

  it('throws at runtime when data lies about its type', () => {
    const forged = { type: 'teleported' } as unknown as CartAction;
    expect(() => cartReducer(initialCart, forged)).toThrow(/Unhandled case/);
  });
});

describe('exhaustiveness (compile-time, checked by tsc)', () => {
  it('the tag is the literal union of all action names', () => {
    expectTypeOf<CartAction['type']>().toEqualTypeOf<
      'added' | 'removed' | 'qtySet' | 'checkoutStarted' | 'paid' | 'cleared'
    >();
  });

  it('narrowing by the tag gives each action its own payload', () => {
    const payload = (a: CartAction) => {
      if (a.type === 'qtySet') expectTypeOf(a).toEqualTypeOf<{ type: 'qtySet'; sku: string; qty: number }>();
    };
    expect(payload).toBeTypeOf('function');
  });

  it('a switch that forgets cases does not compile', () => {
    const label = (a: CartAction): string => {
      switch (a.type) {
        case 'added':
          return 'added';
        default:
          // @ts-expect-error - a is still 'removed' | 'qtySet' | ... here, not never
          return assertNever(a);
      }
    };
    expect(label({ type: 'added', sku: 'a' })).toBe('added');
    expect(() => label({ type: 'cleared' })).toThrow();
  });

  it('a payload that belongs to another member is rejected', () => {
    // @ts-expect-error - 'paid' has no sku
    const bad: CartAction = { type: 'paid', sku: 'a' };
    expect(bad.type).toBe('paid');
  });
});
