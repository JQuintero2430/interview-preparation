import { screen, within } from '@testing-library/react';
import { Cart } from './Cart';
import { KEYBOARD, MOUSE } from './products';
import { makeStore } from './store';
import { renderWithStore } from './testUtils';

test('starts empty', () => {
  renderWithStore(<Cart />);
  expect(screen.getByText('Your cart is empty.')).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('0 items · $0.00');
});

test('add, increase, decrease and remove update the lines and the summary', async () => {
  const { store, user } = renderWithStore(<Cart />);

  await user.click(screen.getByRole('button', { name: 'Add Keyboard' }));
  await user.click(screen.getByRole('button', { name: 'Add Keyboard' }));
  expect(screen.getByText('Keyboard × 2')).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('2 items · $99.98');

  await user.click(screen.getByRole('button', { name: 'Add Mouse' }));
  expect(screen.getByRole('status')).toHaveTextContent('3 items · $119.97');

  await user.click(screen.getByRole('button', { name: 'Decrease Keyboard' }));
  expect(screen.getByText('Keyboard × 1')).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Increase Mouse' }));
  await user.click(screen.getByRole('button', { name: 'Remove Keyboard' }));

  const lines = screen.getByRole('list', { name: 'Cart lines' });
  expect(within(lines).getAllByRole('listitem')).toHaveLength(1);
  expect(within(lines).getByText('Mouse × 2')).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('2 items · $39.98');

  // The UI and the store agree: assert on state too, through the same store instance.
  expect(store.getState().cart.lines).toEqual([{ ...MOUSE, quantity: 2 }]);
});

test('decreasing the last unit removes the line', async () => {
  const store = makeStore({ cart: { lines: [{ ...KEYBOARD, quantity: 1 }], coupon: null } });
  const { user } = renderWithStore(<Cart />, store);

  await user.click(screen.getByRole('button', { name: 'Decrease Keyboard' }));
  expect(screen.getByText('Your cart is empty.')).toBeInTheDocument();
});

test('a preloaded store renders its state, and tests do not share it', () => {
  const store = makeStore({ cart: { lines: [{ ...MOUSE, quantity: 3 }], coupon: null } });
  renderWithStore(<Cart />, store);
  expect(screen.getByRole('status')).toHaveTextContent('3 items · $59.97');
});
