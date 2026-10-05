import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dashboard, type WidgetSpec } from './Dashboard';

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

function makeWidgets(revenue: { down: boolean }): WidgetSpec[] {
  return [
    { id: 'orders', title: 'Orders', load: () => '42 orders today' },
    {
      id: 'revenue',
      title: 'Revenue',
      load: () => {
        if (revenue.down) throw new Error('billing service timeout');
        return '$1,200 today';
      },
    },
  ];
}

test('partial failure: one widget shows its fallback, the rest of the page keeps working', () => {
  render(<Dashboard widgets={makeWidgets({ down: true })} />);

  const revenue = screen.getByRole('region', { name: 'Revenue' });
  expect(within(revenue).getByRole('alert')).toHaveTextContent('Revenue is unavailable right now.');
  expect(within(screen.getByRole('region', { name: 'Orders' })).getByText('42 orders today')).toBeInTheDocument();
  expect(screen.getAllByRole('alert')).toHaveLength(1);
});

test('retry recovers only the failed widget', async () => {
  const user = userEvent.setup();
  const revenueState = { down: true };
  render(<Dashboard widgets={makeWidgets(revenueState)} />);

  revenueState.down = false;
  await user.click(screen.getByRole('button', { name: 'Retry Revenue' }));

  expect(within(screen.getByRole('region', { name: 'Revenue' })).getByText('$1,200 today')).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
