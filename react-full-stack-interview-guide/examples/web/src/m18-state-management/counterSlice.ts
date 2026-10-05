// The legacy counter (legacyRedux.ts) migrated to Redux Toolkit: same actions, same state, same behavior.
import { configureStore, createSlice, type PayloadAction, type ThunkAction, type UnknownAction } from '@reduxjs/toolkit';

export const counterSlice = createSlice({
  name: 'counter',
  initialState: { count: 0 },
  reducers: {
    increment: (state) => {
      state.count += 1;
    },
    add: (state, action: PayloadAction<number>) => {
      state.count += action.payload;
    },
    reset: () => ({ count: 0 }),
  },
});

export const { increment, add, reset } = counterSlice.actions;

/** configureStore adds the thunk middleware and DevTools by default. */
export function makeCounterStore() {
  return configureStore({ reducer: { counter: counterSlice.reducer } });
}

export type CounterRootState = ReturnType<ReturnType<typeof makeCounterStore>['getState']>;
export type CounterDispatch = ReturnType<typeof makeCounterStore>['dispatch'];
type CounterThunk = ThunkAction<void, CounterRootState, unknown, UnknownAction>;

/** Same thunk as the legacy one; only the types changed. */
export const incrementIfOdd = (): CounterThunk => (dispatch, getState) => {
  if (getState().counter.count % 2 !== 0) dispatch(increment());
};
