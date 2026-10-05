import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SortableList } from './SortableList';

test('without browser support for view transitions the list still re-orders (the animation is skipped)', async () => {
  const user = userEvent.setup();
  render(<SortableList items={['pear', 'apple', 'fig']} />);
  const order = () => screen.getAllByRole('listitem').map((li) => li.textContent);

  expect(order()).toEqual(['apple', 'fig', 'pear']);
  await user.click(screen.getByRole('button', { name: 'Reverse' }));
  expect(order()).toEqual(['pear', 'fig', 'apple']);
});
