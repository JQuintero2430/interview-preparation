import { CartAction, CartItem } from './actions';
import { createSelector } from './create-selector';

export interface CartState {
  readonly items: readonly CartItem[];
  readonly discountPercent: number;
}

export const initialCart: CartState = { items: [], discountPercent: 0 };

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case '[Cart Page] Add Item':
      return { ...state, items: [...state.items, action.item] };
    case '[Cart Page] Remove Item':
      return { ...state, items: state.items.filter((item) => item.id !== action.id) };
    case '[Cart Page] Set Discount':
      return { ...state, discountPercent: action.percent };
    default:
      return state;
  }
}

/** One set of selectors per store, so each store has its own one-entry memos. */
export function createCartSelectors() {
  const selectItems = (state: CartState) => state.items;
  const selectDiscount = (state: CartState) => state.discountPercent;
  const selectSubtotal = createSelector(selectItems, (items) =>
    items.reduce((sum, item) => sum + item.price * item.qty, 0),
  );
  const selectTotal = createSelector(selectSubtotal, selectDiscount, (subtotal, percent) =>
    Math.round((subtotal * (100 - percent)) / 100),
  );
  return { selectItems, selectDiscount, selectSubtotal, selectTotal };
}
