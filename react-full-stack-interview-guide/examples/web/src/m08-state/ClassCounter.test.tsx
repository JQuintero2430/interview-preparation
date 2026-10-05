import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClassCounter } from './ClassCounter';

test('object setState three times adds one, and the untouched label survives (merge)', async () => {
  const user = userEvent.setup();
  render(<ClassCounter onLog={() => {}} />);
  await user.click(screen.getByRole('button', { name: 'objects ×3' }));
  expect(screen.getByText('Clicks: 1')).toBeInTheDocument();
});

test('updater setState three times adds three', async () => {
  const user = userEvent.setup();
  render(<ClassCounter onLog={() => {}} />);
  await user.click(screen.getByRole('button', { name: 'updaters ×3' }));
  expect(screen.getByText('Clicks: 3')).toBeInTheDocument();
});

test('this.state is stale right after setState; the callback sees the committed value', async () => {
  const user = userEvent.setup();
  const logs: string[] = [];
  render(<ClassCounter onLog={(m) => logs.push(m)} />);
  await user.click(screen.getByRole('button', { name: 'add and log' }));
  expect(logs).toEqual(['right after setState: 0', 'callback: 1']);
});
