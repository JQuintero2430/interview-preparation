import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SignupCard } from './SignupCard';

test('typing the email keeps the password text, its DOM node and its visibility', async () => {
  const user = userEvent.setup();
  render(<SignupCard />);
  const password = screen.getByLabelText('Password');

  await user.type(password, 'secret');
  await user.click(screen.getByRole('button', { name: 'Show' }));
  await user.type(screen.getByLabelText('Email'), 'ada@example.com');

  expect(screen.getByLabelText('Password')).toBe(password); // same DOM node: not remounted
  expect(password).toHaveValue('secret');
  expect(password).toHaveAttribute('type', 'text');
  expect(screen.getByRole('button', { name: 'Hide' })).toBeInTheDocument();
});

test('the email input keeps focus while typing, so every character lands', async () => {
  const user = userEvent.setup();
  render(<SignupCard />);
  const email = screen.getByLabelText('Email');
  await user.type(email, 'ada@example.com');
  expect(email).toHaveValue('ada@example.com');
  expect(email).toHaveFocus();
  expect(screen.getByText('Signing up as ada@example.com')).toBeInTheDocument();
});
