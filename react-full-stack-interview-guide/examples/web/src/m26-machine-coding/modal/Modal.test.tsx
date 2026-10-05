import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Modal } from './Modal';

function Harness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open
      </button>
      {open && (
        <Modal title="Rename" onClose={() => setOpen(false)}>
          <label>
            Name
            <input />
          </label>
          <button type="button">Save</button>
        </Modal>
      )}
    </>
  );
}

async function openModal() {
  const user = userEvent.setup();
  render(<Harness />);
  await user.click(screen.getByRole('button', { name: 'Open' }));
  return user;
}

test('opens as a labelled modal dialog and moves focus to the first control', async () => {
  await openModal();
  const dialog = screen.getByRole('dialog', { name: 'Rename' });
  expect(dialog).toHaveAttribute('aria-modal', 'true');
  expect(screen.getByLabelText('Name')).toHaveFocus();
});

test('Tab and Shift+Tab wrap inside the dialog', async () => {
  const user = await openModal();
  expect(screen.getByLabelText('Name')).toHaveFocus();

  await user.tab();
  expect(screen.getByRole('button', { name: 'Save' })).toHaveFocus();
  await user.tab();
  expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
  await user.tab(); // would leave the dialog: wraps to the first control
  expect(screen.getByLabelText('Name')).toHaveFocus();

  await user.tab({ shift: true }); // wraps backwards to the last control
  expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
});

test('Escape closes and focus returns to the opener', async () => {
  const user = await openModal();
  await user.keyboard('{Escape}');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Open' })).toHaveFocus();
});

test('the Close button closes and restores focus', async () => {
  const user = await openModal();
  await user.click(screen.getByRole('button', { name: 'Close' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Open' })).toHaveFocus();
});

test('a click on the backdrop closes, a click inside the dialog does not', async () => {
  const user = await openModal();
  await user.click(screen.getByRole('dialog'));
  expect(screen.getByRole('dialog')).toBeInTheDocument();

  await user.click(screen.getByTestId('backdrop'));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
