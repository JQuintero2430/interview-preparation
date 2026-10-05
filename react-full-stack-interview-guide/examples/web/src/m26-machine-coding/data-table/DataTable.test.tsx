import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable, filterRows, sortRows, type Person } from './DataTable';

const rows: Person[] = [
  { id: 1, name: 'Ada', role: 'Engineer', age: 36 },
  { id: 2, name: 'Linus', role: 'Engineer', age: 28 },
  { id: 3, name: 'Grace', role: 'Admiral', age: 45 },
  { id: 4, name: 'Alan', role: 'Mathematician', age: 41 },
];

const names = () =>
  screen
    .getAllByRole('row')
    .slice(1) // the header row
    .map((row) => within(row).getAllByRole('cell')[0]?.textContent);

test('sortRows sorts numbers numerically and text alphabetically without mutating the input', () => {
  const copy = [...rows];
  expect(sortRows(rows, { key: 'age', direction: 'asc' }).map((r) => r.age)).toEqual([28, 36, 41, 45]);
  expect(sortRows(rows, { key: 'name', direction: 'desc' }).map((r) => r.name)).toEqual(['Linus', 'Grace', 'Alan', 'Ada']);
  expect(rows).toEqual(copy);
});

test('sortRows is stable: ties keep the original order', () => {
  expect(sortRows(rows, { key: 'role', direction: 'asc' }).map((r) => r.name)).toEqual(['Grace', 'Ada', 'Linus', 'Alan']);
});

test('filterRows matches name or role, ignoring case and surrounding spaces', () => {
  expect(filterRows(rows, ' ENG ').map((r) => r.name)).toEqual(['Ada', 'Linus']);
  expect(filterRows(rows, '')).toBe(rows);
});

test('renders every row in the original order', () => {
  render(<DataTable rows={rows} />);
  expect(names()).toEqual(['Ada', 'Linus', 'Grace', 'Alan']);
});

test('clicking a header cycles ascending, descending, unsorted and sets aria-sort', async () => {
  const user = userEvent.setup();
  render(<DataTable rows={rows} />);
  const header = screen.getByRole('columnheader', { name: 'Age' });
  const button = within(header).getByRole('button');

  await user.click(button);
  expect(header).toHaveAttribute('aria-sort', 'ascending');
  expect(names()).toEqual(['Linus', 'Ada', 'Alan', 'Grace']);

  await user.click(button);
  expect(header).toHaveAttribute('aria-sort', 'descending');
  expect(names()).toEqual(['Grace', 'Alan', 'Ada', 'Linus']);

  await user.click(button);
  expect(header).toHaveAttribute('aria-sort', 'none');
  expect(names()).toEqual(['Ada', 'Linus', 'Grace', 'Alan']);
});

test('sorting another column resets the previous one', async () => {
  const user = userEvent.setup();
  render(<DataTable rows={rows} />);
  await user.click(within(screen.getByRole('columnheader', { name: 'Age' })).getByRole('button'));
  await user.click(within(screen.getByRole('columnheader', { name: 'Name' })).getByRole('button'));

  expect(screen.getByRole('columnheader', { name: 'Age' })).toHaveAttribute('aria-sort', 'none');
  expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveAttribute('aria-sort', 'ascending');
});

test('filter and sort combine; no match shows an empty message', async () => {
  const user = userEvent.setup();
  render(<DataTable rows={rows} />);
  await user.type(screen.getByLabelText('Filter'), 'eng');
  await user.click(within(screen.getByRole('columnheader', { name: 'Age' })).getByRole('button'));
  expect(names()).toEqual(['Linus', 'Ada']);

  await user.clear(screen.getByLabelText('Filter'));
  await user.type(screen.getByLabelText('Filter'), 'zzz');
  expect(screen.getByText('No matching rows')).toBeInTheDocument();
});
