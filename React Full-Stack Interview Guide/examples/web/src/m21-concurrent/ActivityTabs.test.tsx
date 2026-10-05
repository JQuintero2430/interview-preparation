import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs, log } from './ActivityTabs';

beforeEach(() => {
  log.length = 0;
});

// Predicted before running, then confirmed or corrected by running it on React 19.3.
test('<Activity mode="hidden"> keeps state and DOM, but cleans up effects (and does not run them until visible)', async () => {
  const user = userEvent.setup();
  render(<Tabs mode="activity" />);

  // B is hidden from the start: its subtree renders (pre-rendering) but its effect never runs.
  expect(log).toEqual(['A effect setup']);

  await user.click(screen.getByRole('button', { name: 'A count 0' }));
  await user.click(screen.getByRole('button', { name: 'A count 1' }));
  expect(screen.getByRole('button', { name: 'A count 2' })).toBeInTheDocument();

  log.length = 0;
  await user.click(screen.getByRole('button', { name: 'Show B' }));
  expect(log).toEqual(['A effect cleanup', 'B effect setup']);
  // A is hidden, not gone: still in the DOM, with its state, just not visible. React hides it with
  // `display: none !important`, and accessible-name computation skips hidden text, so its role name
  // is "" and getByRole(..., { name, hidden: true }) cannot find it. getByText ignores visibility.
  expect(screen.getByText('A count 2')).not.toBeVisible();

  await user.click(screen.getByRole('button', { name: 'B count 0' }));

  log.length = 0;
  await user.click(screen.getByRole('button', { name: 'Show A' }));
  expect(log).toEqual(['B effect cleanup', 'A effect setup']);
  expect(screen.getByRole('button', { name: 'A count 2' })).toBeVisible(); // state restored
  expect(screen.getByText('B count 1')).not.toBeVisible();
});

test('conditional rendering throws the state away: the counter restarts at 0', async () => {
  const user = userEvent.setup();
  render(<Tabs mode="conditional" />);

  await user.click(screen.getByRole('button', { name: 'A count 0' }));
  expect(screen.getByRole('button', { name: 'A count 1' })).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Show B' }));
  expect(screen.queryByRole('button', { name: /A count/, hidden: true })).not.toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Show A' }));
  expect(screen.getByRole('button', { name: 'A count 0' })).toBeInTheDocument();
});
