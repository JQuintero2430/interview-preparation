import { act, render, screen } from '@testing-library/react';
import { createStore, useStore, type Store } from './createStore';

type AppState = { count: number; user: string };

function CountLabel({ store, onRender }: { store: Store<AppState>; onRender: () => void }) {
  onRender();
  const count = useStore(store, (s) => s.count);
  return <p>count: {count}</p>;
}

function UserLabel({ store }: { store: Store<AppState> }) {
  const user = useStore(store, (s) => s.user);
  return <p>user: {user}</p>;
}

const increment = (store: Store<AppState>) =>
  act(() => store.setState((s) => ({ ...s, count: s.count + 1 })));

test('every component reading the store sees the same state', () => {
  const store = createStore<AppState>({ count: 0, user: 'ana' });
  render(
    <>
      <CountLabel store={store} onRender={() => {}} />
      <CountLabel store={store} onRender={() => {}} />
    </>,
  );
  increment(store);
  expect(screen.getAllByText('count: 1')).toHaveLength(2);
});

test('a component re-renders only when its selected slice changes', () => {
  const store = createStore<AppState>({ count: 0, user: 'ana' });
  const onRender = vi.fn();
  render(
    <>
      <CountLabel store={store} onRender={onRender} />
      <UserLabel store={store} />
    </>,
  );
  expect(onRender).toHaveBeenCalledTimes(1);

  act(() => store.setState((s) => ({ ...s, user: 'bo' })));
  expect(screen.getByText('user: bo')).toBeInTheDocument();
  expect(onRender).toHaveBeenCalledTimes(1); // count slice unchanged: no re-render

  increment(store);
  expect(onRender).toHaveBeenCalledTimes(2);
});

test('an update that returns the same state notifies nobody', () => {
  const store = createStore<AppState>({ count: 0, user: 'ana' });
  const listener = vi.fn();
  store.subscribe(listener);
  store.setState((s) => s);
  expect(listener).not.toHaveBeenCalled();
});

test('subscribes once on mount and unsubscribes on unmount', () => {
  const store = createStore<AppState>({ count: 0, user: 'ana' });
  const subscribed = vi.fn();
  const unsubscribed = vi.fn();
  const tracked: Store<AppState> = {
    ...store,
    subscribe: (listener) => {
      subscribed();
      const off = store.subscribe(listener);
      return () => {
        unsubscribed();
        off();
      };
    },
  };

  const { unmount } = render(<UserLabel store={tracked} />);
  act(() => tracked.setState((s) => ({ ...s, user: 'bo' })));
  expect(subscribed).toHaveBeenCalledTimes(1); // a stable subscribe function: no resubscribe
  unmount();
  expect(unsubscribed).toHaveBeenCalledTimes(1);
});
