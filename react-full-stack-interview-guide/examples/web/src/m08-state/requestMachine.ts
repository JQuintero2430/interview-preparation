// A finite state machine written as a reducer: switch on the current STATE first, then the event.
// Any event that is not a valid transition from the current state is ignored (same reference back).
export type RequestState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

export type RequestEvent<T> =
  | { type: 'fetch' }
  | { type: 'resolve'; data: T }
  | { type: 'reject'; error: string }
  | { type: 'reset' };

const idle = { status: 'idle' } as const;
const loading = { status: 'loading' } as const;

/** Returns the next request state, or `state` unchanged when `event` is not allowed from it. */
export function requestReducer<T>(state: RequestState<T>, event: RequestEvent<T>): RequestState<T> {
  switch (state.status) {
    case 'idle':
      return event.type === 'fetch' ? loading : state;
    case 'loading':
      if (event.type === 'resolve') return { status: 'success', data: event.data };
      if (event.type === 'reject') return { status: 'error', error: event.error };
      return state; // a second "fetch" while loading is ignored: no duplicate request
    case 'success':
    case 'error':
      if (event.type === 'fetch') return loading; // refresh or retry
      if (event.type === 'reset') return idle;
      return state; // a late "resolve" can no longer overwrite anything
  }
}
