// A cart module written without strict checks. It compiles only with "strict": false.
export interface CartItem {
  sku: string;
  price: number;
  quantity: number;
  coupon?: string;
}

const DISCOUNTS = { SAVE10: 0.1, HALF: 0.5 };

export function addItem(cart, item) {
  const existing = cart.find((line) => line.sku === item.sku);
  if (existing) {
    existing.quantity += item.quantity;
    return cart;
  }
  return [...cart, item];
}

export function lineTotal(item: CartItem): number {
  const rate = DISCOUNTS[item.coupon];
  return item.price * item.quantity * (1 - (rate || 0));
}

export function firstSku(cart: CartItem[]): string {
  return cart[0].sku;
}

export function findItem(cart: CartItem[], sku: string): CartItem {
  return cart.find((line) => line.sku === sku);
}

export function clearCoupon(item: CartItem): CartItem {
  return { ...item, coupon: undefined };
}
