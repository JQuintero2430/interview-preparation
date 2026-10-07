type DeepReadonly<T> = { readonly [K in keyof T]: DeepReadonly<T[K]> };

interface Cart {
  items: { sku: string; qty: number }[];
  total(): number;
}

declare const cart: DeepReadonly<Cart>;
cart.items.push({ sku: 'a-1', qty: 1 });
cart.items[0]!.qty = 2;
export const sum = cart.total();
