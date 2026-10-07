import { TestBed } from '@angular/core/testing';
import { CartStore, type Product } from './cart-store';

const book: Product = { id: 'b1', name: 'Book', priceCents: 1999 };
const pen: Product = { id: 'p1', name: 'Pen', priceCents: 150 };

describe('E17.1 CartStore', () => {
  let store: CartStore;

  beforeEach(() => {
    store = TestBed.inject(CartStore);
  });

  it('starts empty', () => {
    expect(store.isEmpty()).toBe(true);
    expect(store.itemCount()).toBe(0);
    expect(store.totalCents()).toBe(0);
  });

  it('adds a new product as a line with quantity 1', () => {
    store.add(book);
    expect(store.lines()).toEqual([{ product: book, quantity: 1 }]);
  });

  it('increments the quantity when the same product is added again', () => {
    store.add(book);
    store.add(book);
    expect(store.lines()).toEqual([{ product: book, quantity: 2 }]);
    expect(store.itemCount()).toBe(2);
  });

  it('computes the total in cents without floating-point drift', () => {
    store.add(book);
    store.add(pen);
    store.setQuantity(pen.id, 3);
    expect(store.totalCents()).toBe(1999 + 3 * 150);
  });

  it('removes a line when its quantity is set to zero or less', () => {
    store.add(book);
    store.setQuantity(book.id, 0);
    expect(store.isEmpty()).toBe(true);
  });

  it('replaces the array on every change instead of mutating it', () => {
    store.add(book);
    const before = store.lines();
    store.add(pen);
    expect(store.lines()).not.toBe(before);
    expect(before).toHaveLength(1);
  });

  it('exposes a read-only signal with no set or update method', () => {
    expect('set' in store.lines).toBe(false);
    expect('update' in store.lines).toBe(false);
  });

  it('clears all lines', () => {
    store.add(book);
    store.clear();
    expect(store.isEmpty()).toBe(true);
  });
});
