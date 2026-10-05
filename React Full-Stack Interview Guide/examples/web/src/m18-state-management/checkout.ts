import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { CartState } from './cartSlice';
import { API } from './products';

export type Order = { orderId: string; total: number };
export type CheckoutState = {
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  orderId: string | null;
  error: string | null;
};

// The thunk only needs these two slices. Typing them here (instead of importing RootState from
// the store) avoids a circular type: the store's type depends on this file's reducer.
type ThunkConfig = { state: { cart: CartState; checkout: CheckoutState }; rejectValue: string };

/**
 * Posts the current cart as an order. Dispatches `checkout/placeOrder/pending` synchronously,
 * then `/fulfilled` with the server's order or `/rejected` with a readable message.
 */
export const placeOrder = createAsyncThunk<Order, void, ThunkConfig>(
  'checkout/placeOrder',
  async (_arg, { getState, signal, rejectWithValue }) => {
    const { lines } = getState().cart;
    const res = await fetch(`${API}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lines: lines.map(({ id, quantity }) => ({ id, quantity })) }),
      signal, // aborted when the caller calls .abort() on the returned promise
    });
    if (!res.ok) return rejectWithValue(`Checkout failed (HTTP ${res.status})`);
    return (await res.json()) as Order;
  },
  {
    // Runs before `pending`: returning false skips the request and dispatches nothing.
    condition: (_arg, { getState }) => {
      const { cart, checkout } = getState();
      return cart.lines.length > 0 && checkout.status !== 'pending';
    },
  },
);

const initialState: CheckoutState = { status: 'idle', orderId: null, error: null };

export const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    checkoutReset: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(placeOrder.pending, (state) => {
        state.status = 'pending';
        state.error = null;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.orderId = action.payload.orderId;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.status = 'failed';
        // payload is the rejectWithValue message; error.message covers thrown errors (network, abort).
        state.error = action.payload ?? action.error.message ?? 'Unknown error';
      });
  },
});

export const { checkoutReset } = checkoutSlice.actions;
