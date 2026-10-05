// A pure reducer for a shopping cart. No React import: it is plain TypeScript, tested directly.
// `readonly` documents the contract at compile time; the reducer never mutates its input.
export type Product = { readonly id: string; readonly name: string; readonly priceCents: number };
export type CartLine = { readonly product: Product; readonly quantity: number };
export type CartState = { readonly lines: readonly CartLine[] };

export type CartAction =
  | { type: 'added'; product: Product }
  | { type: 'decremented'; productId: string }
  | { type: 'removed'; productId: string }
  | { type: 'cleared' };

export const emptyCart: CartState = { lines: [] };

const hasLine = (state: CartState, productId: string) =>
  state.lines.some((line) => line.product.id === productId);

/**
 * Returns the next cart for an action. Pure: never mutates `state`, and returns `state` itself
 * when nothing changes so that React can skip the re-render.
 */
export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'added': {
      if (!hasLine(state, action.product.id)) {
        return { ...state, lines: [...state.lines, { product: action.product, quantity: 1 }] };
      }
      return {
        ...state,
        // Copy the array and only the line that changes; every other line keeps its reference.
        lines: state.lines.map((line) =>
          line.product.id === action.product.id ? { ...line, quantity: line.quantity + 1 } : line,
        ),
      };
    }
    case 'decremented': {
      if (!hasLine(state, action.productId)) return state; // same reference: React can bail out
      return {
        ...state,
        lines: state.lines
          .map((line) =>
            line.product.id === action.productId ? { ...line, quantity: line.quantity - 1 } : line,
          )
          .filter((line) => line.quantity > 0),
      };
    }
    case 'removed':
      if (!hasLine(state, action.productId)) return state;
      return { ...state, lines: state.lines.filter((line) => line.product.id !== action.productId) };
    case 'cleared':
      return emptyCart;
  }
}

// Derived values: computed from the state on demand, never stored next to it.

/** Total price of the cart in cents. */
export const cartTotalCents = (cart: CartState) =>
  cart.lines.reduce((sum, line) => sum + line.product.priceCents * line.quantity, 0);

/** Number of units in the cart (a line with quantity 2 counts twice). */
export const cartItemCount = (cart: CartState) =>
  cart.lines.reduce((sum, line) => sum + line.quantity, 0);
