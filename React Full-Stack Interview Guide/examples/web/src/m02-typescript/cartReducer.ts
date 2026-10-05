import { assertNever } from './assertNever';

export type CartItem = { sku: string; qty: number };

export type CartState = {
  items: readonly CartItem[];
  status: 'idle' | 'checkingOut' | 'paid';
};

/** A discriminated union: `type` is the tag, and each member carries only its own payload. */
export type CartAction =
  | { type: 'added'; sku: string }
  | { type: 'removed'; sku: string }
  | { type: 'qtySet'; sku: string; qty: number }
  | { type: 'checkoutStarted' }
  | { type: 'paid' }
  | { type: 'cleared' };

export const initialCart: CartState = { items: [], status: 'idle' };

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'added': {
      const existing = state.items.find((i) => i.sku === action.sku);
      const items = existing
        ? state.items.map((i) => (i.sku === action.sku ? { ...i, qty: i.qty + 1 } : i))
        : [...state.items, { sku: action.sku, qty: 1 }];
      return { ...state, items };
    }
    case 'removed':
      return { ...state, items: state.items.filter((i) => i.sku !== action.sku) };
    case 'qtySet':
      return {
        ...state,
        items:
          action.qty <= 0
            ? state.items.filter((i) => i.sku !== action.sku)
            : state.items.map((i) => (i.sku === action.sku ? { ...i, qty: action.qty } : i)),
      };
    case 'checkoutStarted':
      return state.items.length === 0 ? state : { ...state, status: 'checkingOut' };
    case 'paid':
      return state.status === 'checkingOut' ? { items: [], status: 'paid' } : state;
    case 'cleared':
      return initialCart;
    default:
      return assertNever(action);
  }
}
