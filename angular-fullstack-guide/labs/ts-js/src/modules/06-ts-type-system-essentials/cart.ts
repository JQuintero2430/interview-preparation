/** One line in the cart. */
export interface CartItem {
  sku: string;
  price: number;
  quantity: number;
  coupon?: string;
}

const DISCOUNTS: Readonly<Record<string, number>> = { SAVE10: 0.1, HALF: 0.5 };

/**
 * Adds an item, merging it into an existing line with the same SKU.
 * @param cart The current lines; an existing line is updated in place, as the legacy version did.
 * @param item The item to add.
 * @returns The same array when a line was merged, otherwise a new array with the item appended.
 */
export function addItem(cart: CartItem[], item: CartItem): CartItem[] {
  const existing = cart.find((line) => line.sku === item.sku);
  if (existing) {
    existing.quantity += item.quantity;
    return cart;
  }
  return [...cart, item];
}

/**
 * Prices one line after its coupon.
 * @param item The line.
 * @returns Price times quantity, minus the coupon's discount; an unknown coupon gives no discount.
 */
export function lineTotal(item: CartItem): number {
  // Under noUncheckedIndexedAccess the lookup is number | undefined, so the missing case is explicit.
  const rate = item.coupon === undefined ? undefined : DISCOUNTS[item.coupon];
  return item.price * item.quantity * (1 - (rate ?? 0));
}

/**
 * Reads the first line's SKU.
 * @param cart The lines.
 * @returns The SKU of the first line.
 * @throws TypeError when the cart is empty, as the legacy version did implicitly.
 */
export function firstSku(cart: readonly CartItem[]): string {
  const first = cart[0];
  if (first === undefined) throw new TypeError('the cart is empty');
  return first.sku;
}

/**
 * Finds a line by SKU.
 * @param cart The lines.
 * @param sku The SKU to look for.
 * @returns The line, or `undefined` when there is none (the legacy signature hid this case).
 */
export function findItem(cart: readonly CartItem[], sku: string): CartItem | undefined {
  return cart.find((line) => line.sku === sku);
}

/**
 * Removes the coupon from a line.
 * @param item The line.
 * @returns A copy without the `coupon` property.
 */
export function clearCoupon(item: CartItem): CartItem {
  // Omitting the key, rather than setting it to undefined, is what exactOptionalPropertyTypes accepts.
  const { coupon: _removed, ...withoutCoupon } = item;
  return withoutCoupon;
}
