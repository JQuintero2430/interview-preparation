import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PaginatedList, getPageItems } from './Pagination';

describe('getPageItems', () => {
  test('shows every page when there are few', () => {
    expect(getPageItems(2, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(getPageItems(1, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  test('keeps seven slots at the start, in the middle and at the end', () => {
    expect(getPageItems(1, 10)).toEqual([1, 2, 3, 4, 5, '…', 10]);
    expect(getPageItems(3, 10)).toEqual([1, 2, 3, 4, 5, '…', 10]);
    expect(getPageItems(4, 10)).toEqual([1, '…', 3, 4, 5, '…', 10]);
    expect(getPageItems(5, 10)).toEqual([1, '…', 4, 5, 6, '…', 10]);
    expect(getPageItems(8, 10)).toEqual([1, '…', 6, 7, 8, 9, 10]);
    expect(getPageItems(10, 10)).toEqual([1, '…', 6, 7, 8, 9, 10]);
  });

  test('a wider sibling window', () => {
    expect(getPageItems(10, 20, 2)).toEqual([1, '…', 8, 9, 10, 11, 12, '…', 20]);
  });
});

const items = Array.from({ length: 23 }, (_, i) => `Item ${i + 1}`);

test('shows the first page and disables Previous', () => {
  render(<PaginatedList items={items} pageSize={5} />);
  expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual([
    'Item 1',
    'Item 2',
    'Item 3',
    'Item 4',
    'Item 5',
  ]);
  expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page');
});

test('Next, Previous and numbered buttons change the slice', async () => {
  const user = userEvent.setup();
  render(<PaginatedList items={items} pageSize={5} />);

  await user.click(screen.getByRole('button', { name: 'Next' }));
  expect(screen.getByText('Item 6')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');

  await user.click(screen.getByRole('button', { name: 'Page 5' }));
  expect(screen.getAllByRole('listitem')).toHaveLength(3); // 23 items: last page has 3
  expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();

  await user.click(screen.getByRole('button', { name: 'Previous' }));
  expect(screen.getByText('Item 16')).toBeInTheDocument();
});

test('the current page is clamped when the list shrinks', async () => {
  const user = userEvent.setup();
  const { rerender } = render(<PaginatedList items={items} pageSize={5} />);
  await user.click(screen.getByRole('button', { name: 'Page 5' }));

  rerender(<PaginatedList items={items.slice(0, 7)} pageSize={5} />);
  expect(screen.getByText('Item 6')).toBeInTheDocument(); // page 2 of 2
  expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');
});
