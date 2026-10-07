/** One order as the list screen shows it. */
export interface Order {
  id: string;
  total: number;
}

/** The orders screen's state: each status carries only the data that exists in it. */
export type OrdersState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'loaded'; orders: readonly Order[] }
  | { status: 'failed'; error: string };

/** Everything that can happen to the orders screen. */
export type OrdersAction =
  | { type: 'load' }
  | { type: 'loaded'; orders: readonly Order[] }
  | { type: 'failed'; error: string }
  | { type: 'reset' };

/**
 * Compiles only when `value` is `never`, so a switch that calls it in `default` must handle every member.
 * @param value What is left of the union after every case.
 * @returns Never; it always throws, which also covers data from outside the type system.
 */
export function assertNever(value: never): never {
  throw new Error(`unknown action: ${JSON.stringify(value)}`);
}

/**
 * Returns the next state for an action.
 * @param state The current state.
 * @param action What happened.
 * @returns The next state; a result or failure that arrives when nothing is loading is ignored.
 */
export function reduce(state: OrdersState, action: OrdersAction): OrdersState {
  switch (action.type) {
    case 'load':
      return { status: 'loading' };
    case 'loaded':
      // A late response for a request the user already reset must not overwrite the screen.
      return state.status === 'loading' ? { status: 'loaded', orders: action.orders } : state;
    case 'failed':
      return state.status === 'loading' ? { status: 'failed', error: action.error } : state;
    case 'reset':
      return { status: 'idle' };
    default:
      return assertNever(action);
  }
}
