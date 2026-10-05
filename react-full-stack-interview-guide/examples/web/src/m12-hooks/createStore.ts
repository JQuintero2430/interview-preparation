import { useSyncExternalStore } from 'react';

export type Store<S> = {
  getState: () => S;
  setState: (update: (previous: S) => S) => void;
  subscribe: (listener: () => void) => () => void;
};

/**
 * A minimal external store (the core idea of Zustand or Redux): state lives outside React,
 * every update replaces it immutably, and subscribers are told that something changed.
 * @param initialState - The first state.
 * @returns The store. Its functions are closures, so they can be passed around unbound.
 */
export function createStore<S>(initialState: S): Store<S> {
  let state = initialState;
  const listeners = new Set<() => void>();

  return {
    getState: () => state,
    setState: (update) => {
      const next = update(state);
      if (Object.is(next, state)) return;
      state = next;
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

/**
 * Reads a slice of an external store and re-renders only when that slice changes.
 * The selector must return a primitive or a reference that already exists in the state;
 * building a new object or array in it makes every snapshot "different" and loops forever.
 * @param store - A store from `createStore`.
 * @param selector - Picks the slice this component needs.
 * @returns The selected slice.
 */
export function useStore<S, U>(store: Store<S>, selector: (state: S) => U): U {
  const getSnapshot = () => selector(store.getState());
  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}
