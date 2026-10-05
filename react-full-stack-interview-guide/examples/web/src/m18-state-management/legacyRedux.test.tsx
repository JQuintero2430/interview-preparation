import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import * as modern from './counterSlice';
import { LegacyCounter, ModernCounter } from './Counters';
import * as legacy from './legacyRedux';

test('the hand-written reducer and the slice reducer agree on every step', () => {
  const steps = [
    [legacy.increment(), modern.increment()],
    [legacy.add(5), modern.add(5)],
    [legacy.increment(), modern.increment()],
    [legacy.reset(), modern.reset()],
    [legacy.add(2), modern.add(2)],
  ] as const;

  let oldState = legacy.counterReducer(undefined, legacy.reset());
  let newState = modern.counterSlice.reducer(undefined, modern.reset());
  for (const [oldAction, newAction] of steps) {
    oldState = legacy.counterReducer(oldState, oldAction);
    newState = modern.counterSlice.reducer(newState, newAction);
    expect(newState).toEqual(oldState);
  }
  expect(newState).toEqual({ count: 2 });
});

test('the action type strings are the only real difference', () => {
  expect(legacy.increment()).toEqual({ type: 'counter/INCREMENT' });
  expect(modern.increment()).toEqual({ type: 'counter/increment', payload: undefined });
});

test('an unknown action returns the same state object in both', () => {
  const state = { count: 3 };
  expect(legacy.counterReducer(state, { type: 'other' } as unknown as legacy.CounterAction)).toBe(state);
  expect(modern.counterSlice.reducer(state, { type: 'other' })).toBe(state);
});

test('the hand-written thunk middleware runs functions and passes objects on', () => {
  const store = legacy.makeLegacyStore();
  store.dispatch(legacy.incrementIfOdd()); // 0 is even: nothing
  store.dispatch(legacy.increment());
  store.dispatch(legacy.incrementIfOdd()); // 1 is odd: +1
  expect(store.getState()).toEqual({ counter: { count: 2 } });
});

test('connect() still works on react-redux 9 and React 19', async () => {
  const user = userEvent.setup();
  render(
    <Provider store={legacy.makeLegacyStore()}>
      <LegacyCounter />
    </Provider>,
  );
  await user.click(screen.getByRole('button', { name: 'Legacy +1 if odd' }));
  expect(screen.getByText('Legacy count: 0')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Legacy +1' }));
  await user.click(screen.getByRole('button', { name: 'Legacy +1 if odd' }));
  expect(screen.getByText('Legacy count: 2')).toBeInTheDocument();
});

test('the hooks version behaves the same', async () => {
  const user = userEvent.setup();
  render(
    <Provider store={modern.makeCounterStore()}>
      <ModernCounter />
    </Provider>,
  );
  await user.click(screen.getByRole('button', { name: 'Modern +1' }));
  await user.click(screen.getByRole('button', { name: 'Modern +1 if odd' }));
  expect(screen.getByText('Modern count: 2')).toBeInTheDocument();
});
