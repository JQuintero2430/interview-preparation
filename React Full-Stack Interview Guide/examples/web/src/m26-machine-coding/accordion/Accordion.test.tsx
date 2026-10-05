import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Accordion } from './Accordion';

const items = [
  { id: 'a', title: 'Shipping', content: 'Ships in 2 days' },
  { id: 'b', title: 'Returns', content: '30-day returns' },
  { id: 'c', title: 'Warranty', content: 'One year' },
];

// Closed panels are `hidden` (display: none), so they have no accessible name and getByRole
// cannot find them: assert on the text with toBeVisible() instead.
test('starts collapsed and toggles a panel with aria-expanded', async () => {
  const user = userEvent.setup();
  render(<Accordion items={items} />);
  const trigger = screen.getByRole('button', { name: 'Shipping' });

  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  expect(screen.getByText('Ships in 2 days')).not.toBeVisible();

  await user.click(trigger);
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByText('Ships in 2 days')).toBeVisible();

  await user.click(trigger);
  expect(screen.getByText('Ships in 2 days')).not.toBeVisible();
});

test('single mode: opening a panel closes the previous one', async () => {
  const user = userEvent.setup();
  render(<Accordion items={items} />);
  await user.click(screen.getByRole('button', { name: 'Shipping' }));
  await user.click(screen.getByRole('button', { name: 'Returns' }));

  expect(screen.getByText('Ships in 2 days')).not.toBeVisible();
  expect(screen.getByText('30-day returns')).toBeVisible();
});

test('multiple mode: panels open independently', async () => {
  const user = userEvent.setup();
  render(<Accordion items={items} multiple />);
  await user.click(screen.getByRole('button', { name: 'Shipping' }));
  await user.click(screen.getByRole('button', { name: 'Returns' }));

  expect(screen.getByText('Ships in 2 days')).toBeVisible();
  expect(screen.getByText('30-day returns')).toBeVisible();
});

test('the open panel is a labelled region', async () => {
  const user = userEvent.setup();
  render(<Accordion items={items} />);
  await user.click(screen.getByRole('button', { name: 'Warranty' }));
  expect(screen.getByRole('region', { name: 'Warranty' })).toHaveTextContent('One year');
});

test('Enter and Space on a focused header toggle it; arrows, Home and End move focus', async () => {
  const user = userEvent.setup();
  render(<Accordion items={items} />);
  await user.tab();
  expect(screen.getByRole('button', { name: 'Shipping' })).toHaveFocus();

  await user.keyboard('{Enter}');
  expect(screen.getByText('Ships in 2 days')).toBeVisible();

  await user.keyboard('{ArrowDown}');
  expect(screen.getByRole('button', { name: 'Returns' })).toHaveFocus();
  await user.keyboard(' ');
  expect(screen.getByText('30-day returns')).toBeVisible();

  await user.keyboard('{End}');
  expect(screen.getByRole('button', { name: 'Warranty' })).toHaveFocus();
  await user.keyboard('{Home}');
  expect(screen.getByRole('button', { name: 'Shipping' })).toHaveFocus();
});
