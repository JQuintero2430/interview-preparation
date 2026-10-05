import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { placeOrder } from './checkout';
import type { Product } from './products';

export type CartLine = Product & { quantity: number };
export type CartState = { lines: CartLine[]; coupon: string | null };

export const initialCartState: CartState = { lines: [], coupon: null };

export const cartSlice = createSlice({
  name: 'cart',
  initialState: initialCartState,
  // Case reducers "mutate" an Immer draft; Immer turns the mutations into a new immutable state.
  reducers: {
    itemAdded(state, action: PayloadAction<Product>) {
      const line = state.lines.find((l) => l.id === action.payload.id);
      if (line) line.quantity += 1;
      else state.lines.push({ ...action.payload, quantity: 1 });
    },
    quantityChanged(state, action: PayloadAction<{ id: string; quantity: number }>) {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        // Reassigning a draft property is fine too; returning a new state is the other option.
        state.lines = state.lines.filter((l) => l.id !== id);
        return;
      }
      const line = state.lines.find((l) => l.id === id);
      if (line) line.quantity = quantity;
    },
    itemRemoved(state, action: PayloadAction<string>) {
      state.lines = state.lines.filter((l) => l.id !== action.payload);
    },
    couponApplied(state, action: PayloadAction<string | null>) {
      state.coupon = action.payload;
    },
    // Returning a value replaces the state instead of mutating the draft.
    cleared: () => initialCartState,
  },
  // Reacting to an action this slice did not define: builder callback only (RTK 2 removed the object form).
  extraReducers: (builder) => {
    builder.addCase(placeOrder.fulfilled, () => initialCartState);
  },
  // RTK 2: selectors declared on the slice receive the slice state, and are exposed for the root state.
  selectors: {
    selectLineCount: (state) => state.lines.length,
  },
});

export const { itemAdded, quantityChanged, itemRemoved, couponApplied, cleared } = cartSlice.actions;
export const cartReducer = cartSlice.reducer;
