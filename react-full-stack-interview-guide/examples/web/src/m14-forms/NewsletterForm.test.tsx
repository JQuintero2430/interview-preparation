import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fakeServer } from './api';
import { NewsletterForm, subscribeAction } from './NewsletterForm';

beforeEach(() => fakeServer.reset());

const emailInput = () => screen.getByLabelText('Email');

function formDataWith(email: string) {
  const data = new FormData();
  data.set('email', email);
  return data;
}

test('the Action is a plain async function you can unit-test without rendering', async () => {
  await expect(subscribeAction({ status: 'idle' }, formDataWith('nope'))).resolves.toEqual({
    status: 'error',
    email: 'nope',
    message: 'Enter a valid email',
  });
  await expect(subscribeAction({ status: 'idle' }, formDataWith(' ana@example.com '))).resolves.toEqual({
    status: 'success',
    email: 'ana@example.com',
  });
});

test('useFormStatus shows the pending state; success resets the uncontrolled input', async () => {
  const user = userEvent.setup();
  fakeServer.hold();
  render(<NewsletterForm />);

  await user.type(emailInput(), 'ana@example.com');
  await user.click(screen.getByRole('button', { name: 'Subscribe' }));

  expect(fakeServer.pending()).toEqual(['subscribe ana@example.com']);
  expect(screen.getByRole('button', { name: 'Subscribing…' })).toBeDisabled();

  await act(async () => fakeServer.resolveNext());

  expect(await screen.findByRole('status')).toHaveTextContent('Subscribed ana@example.com. Check your inbox.');
  expect(emailInput()).toHaveValue('');
  expect(screen.getByRole('button', { name: 'Subscribe' })).toBeEnabled();
});

test('a validation error keeps what the user typed (the reset lands on the new defaultValue)', async () => {
  const user = userEvent.setup();
  render(<NewsletterForm />);

  await user.type(emailInput(), 'ana@');
  await user.click(screen.getByRole('button', { name: 'Subscribe' }));

  expect(await screen.findByText('Enter a valid email')).toBeInTheDocument();
  expect(emailInput()).toHaveAccessibleDescription('Enter a valid email');
  expect(emailInput()).toHaveAttribute('aria-invalid', 'true');
  expect(emailInput()).toHaveValue('ana@');
});

test('a server error is returned as state, not thrown', async () => {
  const user = userEvent.setup();
  render(<NewsletterForm />);

  await user.type(emailInput(), 'bo@blocked.test');
  await user.click(screen.getByRole('button', { name: 'Subscribe' }));

  expect(await screen.findByText('This domain cannot subscribe')).toBeInTheDocument();
  expect(emailInput()).toHaveAccessibleDescription('This domain cannot subscribe');
  expect(emailInput()).toHaveValue('bo@blocked.test');
});
