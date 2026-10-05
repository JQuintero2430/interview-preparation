import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fakeServer } from './api';
import { LegacyNewsletterForm } from './LegacyNewsletterForm';

beforeEach(() => fakeServer.reset());

const emailInput = () => screen.getByLabelText('Email');

test('manual isSubmitting disables the button; success clears the controlled input', async () => {
  const user = userEvent.setup();
  fakeServer.hold();
  render(<LegacyNewsletterForm />);

  await user.type(emailInput(), 'ana@example.com');
  await user.click(screen.getByRole('button', { name: 'Subscribe' }));
  expect(screen.getByRole('button', { name: 'Subscribing…' })).toBeDisabled();

  await act(async () => fakeServer.resolveNext());
  expect(screen.getByRole('status')).toHaveTextContent('Subscribed ana@example.com.');
  expect(emailInput()).toHaveValue('');
});

test('an error is caught, shown, and the finally block re-enables the button', async () => {
  const user = userEvent.setup();
  render(<LegacyNewsletterForm />);

  await user.type(emailInput(), 'bo@blocked.test');
  await user.click(screen.getByRole('button', { name: 'Subscribe' }));

  expect(await screen.findByText('This domain cannot subscribe')).toBeInTheDocument();
  expect(emailInput()).toHaveAccessibleDescription('This domain cannot subscribe');
  expect(emailInput()).toHaveValue('bo@blocked.test');
  expect(screen.getByRole('button', { name: 'Subscribe' })).toBeEnabled();
});

test('native constraint validation blocks the submit before React sees it (no noValidate here)', async () => {
  const user = userEvent.setup();
  fakeServer.hold(); // so a request, if one were sent, would show up in pending()
  render(<LegacyNewsletterForm />);

  await user.click(screen.getByRole('button', { name: 'Subscribe' })); // empty + required
  expect(fakeServer.pending()).toEqual([]);
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  expect(emailInput()).toBeInvalid();
});
