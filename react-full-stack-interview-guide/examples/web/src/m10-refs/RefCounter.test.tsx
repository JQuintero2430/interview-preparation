import { Profiler } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RefCounter } from './RefCounter';

test('writing to a ref does not commit a render; reading it in a handler sees the latest value', async () => {
  const user = userEvent.setup();
  const onRender = vi.fn();
  render(
    <Profiler id="counter" onRender={onRender}>
      <RefCounter />
    </Profiler>,
  );
  expect(onRender).toHaveBeenCalledTimes(1); // the mount

  const silent = screen.getByRole('button', { name: 'Count silently' });
  await user.click(silent);
  await user.click(silent);
  await user.click(silent);
  expect(onRender).toHaveBeenCalledTimes(1); // three ref writes, zero renders
  expect(screen.getByText('Not shown yet')).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Show count' }));
  expect(screen.getByText('Clicked 3 times')).toBeInTheDocument();
  expect(onRender).toHaveBeenCalledTimes(2); // only the state update rendered
});
