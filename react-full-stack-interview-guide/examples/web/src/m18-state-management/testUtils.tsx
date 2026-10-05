import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { makeStore, type AppStore } from './store';

/** A `wrapper` for `render`: `rerender` keeps the same store. */
export function createStoreWrapper(store: AppStore) {
  return function StoreWrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  };
}

/**
 * Renders `ui` inside a Provider with a FRESH store (one per test, never a shared singleton).
 * @param store - Pass a preloaded store (`makeStore({ cart })`) to start from a fixture.
 * @returns The store (to assert on state or dispatch directly), a user-event instance and RTL's result.
 */
export function renderWithStore(ui: ReactElement, store: AppStore = makeStore()) {
  return { store, user: userEvent.setup(), ...render(ui, { wrapper: createStoreWrapper(store) }) };
}
