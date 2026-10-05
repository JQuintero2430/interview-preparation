import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SignupForm } from './SignupForm';

const submitButton = () => screen.getByRole('button', { name: 'Sign up' });

test('starts disabled and shows no errors before any field is touched', () => {
  render(<SignupForm onSubmit={() => {}} />);
  expect(submitButton()).toBeDisabled();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('an error appears only after leaving the field, and disappears as soon as it is fixed', async () => {
  const user = userEvent.setup();
  render(<SignupForm onSubmit={() => {}} />);
  const email = screen.getByLabelText('Email');

  await user.type(email, 'ana');
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  await user.tab();
  expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid email');
  expect(email).toHaveAttribute('aria-invalid', 'true');

  // Typing back into Email blurs Password, so Password's own error appears; check only Email's.
  await user.type(email, '@example.com');
  expect(screen.queryByText('Enter a valid email')).not.toBeInTheDocument();
  expect(email).toHaveAttribute('aria-invalid', 'false');
});

test('valid values enable the button and submit exactly what was typed', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();
  render(<SignupForm onSubmit={onSubmit} />);

  await user.type(screen.getByLabelText('Email'), 'ana@example.com');
  await user.type(screen.getByLabelText('Password'), 'correct-horse');
  await user.type(screen.getByLabelText('Confirm password'), 'correct-hors');
  expect(submitButton()).toBeDisabled();

  await user.type(screen.getByLabelText('Confirm password'), 'e');
  await user.click(submitButton());
  expect(onSubmit).toHaveBeenCalledWith({
    email: 'ana@example.com',
    password: 'correct-horse',
    confirm: 'correct-horse',
  });
});
