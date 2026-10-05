import { combineSlices, configureStore } from '@reduxjs/toolkit';
import { cartSlice } from './cartSlice';
import { checkoutSlice } from './checkout';
import { productsApi } from './productsApi';

// combineSlices reads each slice's `reducerPath` (its name) and builds { cart, checkout, productsApi }.
const rootReducer = combineSlices(cartSlice, checkoutSlice, productsApi);

export type RootState = ReturnType<typeof rootReducer>;

/**
 * A store factory instead of a module-level singleton: every test (and every SSR request)
 * gets a fresh store, so no state leaks between them.
 * @param preloadedState - Optional starting state, e.g. a cart restored from storage or a test fixture.
 */
export function makeStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    // RTK 2: `middleware` must be a callback. The defaults are thunk plus, in development,
    // the immutability and serializability checks.
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(productsApi.middleware),
    preloadedState,
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore['dispatch'];
