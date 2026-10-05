import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { resetCartStore, useCartStore } from './cartStore';
import { KEYBOARD, MOUSE } from './products';
import { ZustandCart } from './ZustandCart';

beforeEach(() => resetCartStore());

test('starts empty, with no Provider', () => {
  render(<ZustandCart />);
  expect(screen.getByText('Your cart is empty.')).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('0 items · $0.00');
});

test('add, increase, decrease and remove: the same behavior as the RTK cart', async () => {
  const user = userEvent.setup();
  render(<ZustandCart />);

  await user.click(screen.getByRole('button', { name: 'Add Keyboard' }));
  await user.click(screen.getByRole('button', { name: 'Add Keyboard' }));
  await user.click(screen.getByRole('button', { name: 'Add Mouse' }));
  expect(screen.getByRole('status')).toHaveTextContent('3 items · $119.97');

  await user.click(screen.getByRole('button', { name: 'Decrease Keyboard' }));
  await user.click(screen.getByRole('button', { name: 'Increase Mouse' }));
  await user.click(screen.getByRole('button', { name: 'Remove Keyboard' }));

  const lines = screen.getByRole('list', { name: 'Cart lines' });
  expect(within(lines).getAllByRole('listitem')).toHaveLength(1);
  expect(within(lines).getByText('Mouse × 2')).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('2 items · $39.98');
  expect(useCartStore.getState().lines).toEqual([{ ...MOUSE, quantity: 2 }]);
});

test('seeding state before render: setState is the fixture API', () => {
  useCartStore.setState({ lines: [{ ...KEYBOARD, quantity: 3 }] });
  render(<ZustandCart />);
  expect(screen.getByText('Keyboard × 3')).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('3 items · $149.97');
});
