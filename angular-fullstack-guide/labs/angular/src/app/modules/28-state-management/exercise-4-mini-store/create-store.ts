import { isDevMode, signal, Signal } from '@angular/core';
import { Action } from './actions';

export type Reducer<S, A extends Action> = (state: S, action: A) => S;

export interface StoreOptions {
  /** Deep-freeze the initial state and every next state, in development mode only. */
  readonly freeze?: boolean;
}

export interface Store<S, A extends Action> {
  readonly state: Signal<S>;
  dispatch(action: A): void;
}

export function deepFreeze<T>(value: T): T {
  if (typeof value === 'object' && value !== null && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) {
      deepFreeze(child);
    }
  }
  return value;
}

export function createStore<S, A extends Action>(
  reducer: Reducer<S, A>,
  initial: S,
  options: StoreOptions = {},
): Store<S, A> {
  const freeze = options.freeze === true && isDevMode();
  const current = signal(freeze ? deepFreeze(initial) : initial);

  return {
    state: current.asReadonly(),
    dispatch(action: A): void {
      const next = reducer(current(), action);
      current.set(freeze ? deepFreeze(next) : next);
    },
  };
}
