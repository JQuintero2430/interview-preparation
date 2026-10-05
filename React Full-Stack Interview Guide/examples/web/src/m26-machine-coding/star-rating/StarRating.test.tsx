import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StarRating } from './StarRating';

test('clicking a star selects it and reports the value', async () => {
  const onChange = vi.fn();
  const user = userEvent.setup();
  render(<StarRating onChange={onChange} />);

  await user.click(screen.getByRole('radio', { name: '3 stars' }));

  expect(screen.getByRole('radio', { name: '3 stars' })).toBeChecked();
  expect(screen.getByRole('radio', { name: '2 stars' })).not.toBeChecked();
  expect(onChange).toHaveBeenCalledWith(3);
});

test('hovering previews the fill without changing the value, and leaving restores it', async () => {
  const user = userEvent.setup();
  render(<StarRating defaultValue={2} />);

  await user.hover(screen.getByRole('radio', { name: '4 stars' }));
  expect(screen.getByRole('radio', { name: '4 stars' })).toHaveAttribute('data-filled', 'true');
  expect(screen.getByRole('radio', { name: '2 stars' })).toBeChecked();

  await user.unhover(screen.getByRole('radio', { name: '4 stars' }));
  expect(screen.getByRole('radio', { name: '3 stars' })).toHaveAttribute('data-filled', 'false');
  expect(screen.getByRole('radio', { name: '2 stars' })).toHaveAttribute('data-filled', 'true');
});

test('arrow keys change the rating, move focus and clamp at the ends', async () => {
  const user = userEvent.setup();
  render(<StarRating max={3} />);

  await user.click(screen.getByRole('radio', { name: '2 stars' }));
  await user.keyboard('{ArrowRight}');
  expect(screen.getByRole('radio', { name: '3 stars' })).toBeChecked();
  expect(screen.getByRole('radio', { name: '3 stars' })).toHaveFocus();

  await user.keyboard('{ArrowRight}');
  expect(screen.getByRole('radio', { name: '3 stars' })).toBeChecked();

  await user.keyboard('{ArrowLeft}{ArrowLeft}{ArrowLeft}');
  expect(screen.getByRole('radio', { name: '1 star' })).toBeChecked();
});

test('only one star is a tab stop', async () => {
  const user = userEvent.setup();
  render(<StarRating defaultValue={4} />);
  const stops = screen.getAllByRole('radio').filter((star) => star.tabIndex === 0);
  expect(stops).toHaveLength(1);
  await user.tab();
  expect(screen.getByRole('radio', { name: '4 stars' })).toHaveFocus();
});
