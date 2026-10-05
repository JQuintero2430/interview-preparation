import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SimpleTabs } from './SimpleTabs';

const tabs = [
  { id: 'one', label: 'Profile', content: 'Profile content' },
  { id: 'two', label: 'Billing', content: 'Billing content' },
  { id: 'three', label: 'Security', content: 'Security content' },
];

test('shows the first panel and exposes tab/tabpanel roles with the right wiring', () => {
  render(<SimpleTabs tabs={tabs} label="Settings" />);
  expect(screen.getByRole('tablist', { name: 'Settings' })).toBeInTheDocument();
  expect(screen.getByRole('tab', { name: 'Profile' })).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByRole('tabpanel', { name: 'Profile' })).toHaveTextContent('Profile content');
  expect(screen.getAllByRole('tabpanel')).toHaveLength(1);
});

test('clicking a tab swaps the panel', async () => {
  const user = userEvent.setup();
  render(<SimpleTabs tabs={tabs} label="Settings" />);
  await user.click(screen.getByRole('tab', { name: 'Billing' }));
  expect(screen.getByRole('tab', { name: 'Billing' })).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByRole('tabpanel', { name: 'Billing' })).toHaveTextContent('Billing content');
  expect(screen.queryByText('Profile content')).not.toBeInTheDocument();
});

test('arrow keys select and focus, wrapping at both ends; Home and End jump', async () => {
  const user = userEvent.setup();
  render(<SimpleTabs tabs={tabs} label="Settings" />);
  await user.tab();
  expect(screen.getByRole('tab', { name: 'Profile' })).toHaveFocus();

  await user.keyboard('{ArrowRight}');
  expect(screen.getByRole('tab', { name: 'Billing' })).toHaveFocus();
  expect(screen.getByRole('tabpanel')).toHaveTextContent('Billing content');

  await user.keyboard('{End}');
  expect(screen.getByRole('tab', { name: 'Security' })).toHaveFocus();
  await user.keyboard('{ArrowRight}');
  expect(screen.getByRole('tab', { name: 'Profile' })).toHaveFocus();
  await user.keyboard('{ArrowLeft}');
  expect(screen.getByRole('tab', { name: 'Security' })).toHaveFocus();
  await user.keyboard('{Home}');
  expect(screen.getByRole('tab', { name: 'Profile' })).toHaveFocus();
});

test('only the selected tab is in the tab order, and Tab moves into the panel', async () => {
  const user = userEvent.setup();
  render(<SimpleTabs tabs={tabs} label="Settings" />);
  expect(screen.getByRole('tab', { name: 'Billing' })).toHaveAttribute('tabindex', '-1');
  await user.tab();
  await user.tab();
  expect(screen.getByRole('tabpanel')).toHaveFocus();
});
