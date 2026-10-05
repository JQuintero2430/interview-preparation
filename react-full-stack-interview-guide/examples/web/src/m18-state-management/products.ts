// Shared catalog for every m18 example. Prices are integer cents, so totals never hit float rounding.
export const API = 'https://api.example.test';

export type Product = { id: string; name: string; price: number };

export const KEYBOARD: Product = { id: 'kb', name: 'Keyboard', price: 4999 };
export const MOUSE: Product = { id: 'mouse', name: 'Mouse', price: 1999 };
export const CABLE: Product = { id: 'cable', name: 'Cable', price: 499 };

export const CATALOG: readonly Product[] = [KEYBOARD, MOUSE, CABLE];

/** 4999 → "$49.99" */
export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/** "1 item", "3 items" */
export function itemCount(count: number): string {
  return `${count} ${count === 1 ? 'item' : 'items'}`;
}
