import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fakeServer } from './api';
import { RhfSignupForm } from './RhfSignupForm';

beforeEach(() => fakeServer.reset());

const email = () => screen.getByLabelText('Email');
const password = () => screen.getByLabelText('Password');
const confirm = () => screen.getByLabelText('Confirm password');

async function fillValid(user: ReturnType<typeof userEvent.setup>, address = 'ana@example.com') {
  await user.type(email(), address);
  await user.type(password(), 'correct-horse');
  await user.type(confirm(), 'correct-horse');
}

test('submitting empty shows the schema errors and focuses the first invalid field', async () => {
  const user = userEvent.setup();
  render(<RhfSignupForm onRegistered={() => {}} />);

  await user.click(screen.getByRole('button', { name: 'Create account' }));

  await waitFor(() => expect(email()).toHaveAccessibleDescription('Enter a valid email'));
  expect(email()).toHaveAttribute('aria-invalid', 'true');
  // The password description is "hint + error"; match the error part only.
  expect(password()).toHaveAccessibleDescription(/Password must be at least 8 characters/);
  // '' === '' so the cross-field rule passes: no error on confirm.
  expect(confirm()).not.toHaveAccessibleDescription();
  expect(email()).toHaveFocus();
});

test('mode "onTouched": silent while typing the first time, error on blur, cleared on the next change', async () => {
  const user = userEvent.setup();
  render(<RhfSignupForm onRegistered={() => {}} />);

  await user.type(email(), 'ana');
  expect(email()).not.toHaveAccessibleDescription();

  await user.tab();
  await waitFor(() => expect(email()).toHaveAccessibleDescription('Enter a valid email'));

  await user.type(email(), '@example.com');
  await waitFor(() => expect(email()).not.toHaveAccessibleDescription());
  expect(email()).not.toHaveAttribute('aria-invalid');
});

test('the cross-field rule reports on the confirm field only', async () => {
  const user = userEvent.setup();
  render(<RhfSignupForm onRegistered={() => {}} />);

  await user.type(email(), 'ana@example.com');
  await user.type(password(), 'correct-horse');
  await user.type(confirm(), 'correct-hors');
  await user.click(screen.getByRole('button', { name: 'Create account' }));

  await waitFor(() => expect(confirm()).toHaveAccessibleDescription('Passwords do not match'));
  expect(password()).toHaveAccessibleDescription('Use 8 or more characters.');
});

test('a server-side rule (taken email) becomes a field error and moves focus there', async () => {
  const user = userEvent.setup();
  const onRegistered = vi.fn();
  render(<RhfSignupForm onRegistered={onRegistered} />);

  await fillValid(user, 'taken@example.com');
  await user.click(screen.getByRole('button', { name: 'Create account' }));

  await waitFor(() => expect(email()).toHaveAccessibleDescription('This email is already registered'));
  expect(email()).toHaveFocus();
  expect(onRegistered).not.toHaveBeenCalled();
});

test('a transport failure shows a form-level alert', async () => {
  const user = userEvent.setup();
  render(<RhfSignupForm onRegistered={() => {}} />);

  await fillValid(user);
  fakeServer.failNextRequest('offline');
  await user.click(screen.getByRole('button', { name: 'Create account' }));

  expect(await screen.findByText('Could not reach the server. Try again.')).toBeInTheDocument();
});

test('the button is disabled while the request is in flight, then the new user id is reported', async () => {
  const user = userEvent.setup();
  const onRegistered = vi.fn();
  fakeServer.hold();
  render(<RhfSignupForm onRegistered={onRegistered} />);

  await fillValid(user);
  await user.click(screen.getByRole('button', { name: 'Create account' }));

  await waitFor(() => expect(fakeServer.pending()).toEqual(['register ana@example.com']));
  expect(screen.getByRole('button', { name: 'Creating account…' })).toBeDisabled();

  await act(async () => fakeServer.resolveNext());
  await waitFor(() => expect(onRegistered).toHaveBeenCalledWith('user-2'));
  expect(screen.getByRole('button', { name: 'Create account' })).toBeEnabled();
});
