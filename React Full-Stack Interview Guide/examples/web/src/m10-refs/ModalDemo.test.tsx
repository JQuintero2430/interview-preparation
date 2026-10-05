import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModalDemo } from './ModalDemo';

test('the dialog is rendered into document.body, outside the component container', async () => {
  const user = userEvent.setup();
  const { container } = render(<ModalDemo />);

  await user.click(screen.getByRole('button', { name: 'Open settings' }));

  const dialog = screen.getByRole('dialog', { name: 'Settings' });
  expect(dialog.parentElement).toBe(document.body);
  expect(container).not.toContainElement(dialog);
});

test('opening focuses the dialog; Escape closes it and focus returns to the opener', async () => {
  const user = userEvent.setup();
  render(<ModalDemo />);
  const opener = screen.getByRole('button', { name: 'Open settings' });

  await user.click(opener);
  expect(screen.getByRole('dialog', { name: 'Settings' })).toHaveFocus();

  await user.keyboard('{Escape}');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(opener).toHaveFocus();
});

test('a click inside the portal bubbles to the React parent, not the DOM parent', async () => {
  const user = userEvent.setup();
  render(<ModalDemo />);

  await user.click(screen.getByRole('button', { name: 'Open settings' }));
  expect(screen.getByText('Clicks seen by the wrapper: 0')).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Save' }));
  expect(screen.getByText('Clicks seen by the wrapper: 1')).toBeInTheDocument();
});
