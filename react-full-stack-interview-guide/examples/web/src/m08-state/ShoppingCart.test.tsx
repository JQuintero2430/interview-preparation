import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShoppingCart } from './ShoppingCart';
import type { Product } from './cartReducer';

const products: Product[] = [
  { id: 'apple', name: 'Apple', priceCents: 50 },
  { id: 'pear', name: 'Pear', priceCents: 75 },
];

test('adding and removing items updates the lines and the derived total in the same render', async () => {
  const user = userEvent.setup();
  render(<ShoppingCart products={products} />);
  expect(screen.getByText('Your cart is empty')).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Add Apple' }));
  await user.click(screen.getByRole('button', { name: 'Add Apple' }));
  await user.click(screen.getByRole('button', { name: 'Add Pear' }));
  expect(screen.getByText('Apple × 2')).toBeInTheDocument();
  expect(screen.getByText('Total: $1.75 (3 items)')).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Remove one Pear' }));
  expect(screen.queryByText('Pear × 1')).not.toBeInTheDocument();
  expect(screen.getByText('Total: $1.00 (2 items)')).toBeInTheDocument();
});

test('clearing empties the cart and disables the button', async () => {
  const user = userEvent.setup();
  render(<ShoppingCart products={products} />);
  await user.click(screen.getByRole('button', { name: 'Add Pear' }));
  await user.click(screen.getByRole('button', { name: 'Clear cart' }));
  expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Clear cart' })).toBeDisabled();
});
