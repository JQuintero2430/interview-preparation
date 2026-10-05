import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilteredList, filterProducts, type Product } from './FilteredList';

const products: Product[] = [
  { id: 'p1', name: 'Teapot', inStock: true },
  { id: 'p2', name: 'Kettle', inStock: false },
  { id: 'p3', name: 'Tea cups', inStock: true },
];

const itemTexts = () => screen.getAllByRole('listitem').map((li) => li.textContent);

test('shows everything at first, with no stray "0" from the hidden-count badge', () => {
  const { container } = render(<FilteredList products={products} />);
  expect(itemTexts()).toEqual(['Teapot', 'Kettle (sold out)', 'Tea cups']);
  expect(screen.getByRole('status')).toHaveTextContent('3 of 3 shown');
  expect(screen.queryByText(/hidden by filters/)).not.toBeInTheDocument();
  expect(container.textContent).not.toContain('0');
});

test('typing filters case-insensitively and reports how many are hidden', async () => {
  render(<FilteredList products={products} />);
  await userEvent.type(screen.getByLabelText('Filter'), 'TEA');
  expect(itemTexts()).toEqual(['Teapot', 'Tea cups']);
  expect(screen.getByRole('status')).toHaveTextContent('2 of 3 shown');
  expect(screen.getByText('1 hidden by filters')).toBeInTheDocument();
});

test('the stock filter combines with the text filter', async () => {
  render(<FilteredList products={products} />);
  await userEvent.click(screen.getByLabelText('In stock only'));
  expect(itemTexts()).toEqual(['Teapot', 'Tea cups']);
  await userEvent.type(screen.getByLabelText('Filter'), 'kettle');
  expect(screen.queryByRole('list')).not.toBeInTheDocument();
  expect(screen.getByText('No matching products')).toBeInTheDocument();
});

test('filterProducts is pure: it never mutates its input', () => {
  const frozen = Object.freeze(products.map((p) => Object.freeze({ ...p })));
  expect(filterProducts(frozen, 'pot', false).map((p) => p.id)).toEqual(['p1']);
  expect(frozen).toHaveLength(3);
});
