// Hand-written Redux as it was written roughly 2015–2019. Read it to recognize it; don't write new code like this.
// Legacy files import these from 'redux' and 'redux-thunk'. RTK re-exports all of 'redux', so this
// example imports from '@reduxjs/toolkit' instead of adding direct dependencies.
import { applyMiddleware, combineReducers, createStore, type Dispatch, type Middleware } from '@reduxjs/toolkit';

// 1) Action type constants, so a typo becomes an undefined-variable error instead of a silent no-op.
export const INCREMENT = 'counter/INCREMENT';
export const ADD = 'counter/ADD';
export const RESET = 'counter/RESET';

export type CounterAction = { type: typeof INCREMENT } | { type: typeof ADD; payload: number } | { type: typeof RESET };

// 2) Action creators: functions that build the action objects.
export const increment = (): CounterAction => ({ type: INCREMENT });
export const add = (amount: number): CounterAction => ({ type: ADD, payload: amount });
export const reset = (): CounterAction => ({ type: RESET });

// 3) A switch reducer with hand-written immutable updates (spread), and a default branch that
//    returns the same state for every action it doesn't own.
export type CounterState = { count: number };
const initialState: CounterState = { count: 0 };

export function counterReducer(state: CounterState = initialState, action: CounterAction): CounterState {
  switch (action.type) {
    case INCREMENT:
      return { ...state, count: state.count + 1 };
    case ADD:
      return { ...state, count: state.count + action.payload };
    case RESET:
      return initialState;
    default:
      return state;
  }
}

// 4) combineReducers: one key per reducer; the root state is { counter: CounterState }.
export const legacyRootReducer = combineReducers({ counter: counterReducer });
export type LegacyRootState = ReturnType<typeof legacyRootReducer>;

// 5) A thunk is a function you dispatch instead of an object. This is the whole of redux-thunk's idea.
export type LegacyThunk = (dispatch: Dispatch, getState: () => LegacyRootState) => void;

const thunkMiddleware: Middleware<(thunk: LegacyThunk) => void, LegacyRootState> =
  ({ dispatch, getState }) =>
  (next) =>
  (action) => {
    if (typeof action === 'function') return (action as LegacyThunk)(dispatch, getState);
    return next(action);
  };

/** A thunk that reads state before deciding what to dispatch. */
export const incrementIfOdd = (): LegacyThunk => (dispatch, getState) => {
  if (getState().counter.count % 2 !== 0) dispatch(increment());
};

/**
 * 6) createStore + applyMiddleware. `createStore` has been marked deprecated since Redux 4.2
 * (strikethrough only; it still works). `legacy_createStore` is the same function without the mark.
 */
export function makeLegacyStore() {
  // The explicit `undefined` preloaded state selects the 3-argument overload; with the enhancer as the
  // 2nd argument, Redux 5's types infer the preloaded state as `Partial<{ counter: never }>` and fail.
  return createStore(legacyRootReducer, undefined, applyMiddleware(thunkMiddleware));
}
