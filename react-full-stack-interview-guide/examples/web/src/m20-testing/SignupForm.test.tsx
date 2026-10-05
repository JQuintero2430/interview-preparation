import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SignupForm, validate } from './SignupForm';

// One setup function instead of nested beforeEach blocks: each test reads top to bottom.
function setup() {
  const onSubmit = vi.fn();
  const user = userEvent.setup();
  render(<SignupForm onSubmit={onSubmit} />);
  // Every query is scoped to the form, so an unrelated message elsewhere on the page can't break a test.
  const form = screen.getByRole('form', { name: 'Sign up' });
  return {
    user,
    onSubmit,
    form,
    email: within(form).getByRole('textbox', { name: 'Email' }),
    // <input type="password"> has no ARIA role, so getByRole cannot find it: use its label.
    password: within(form).getByLabelText('Password'),
    submit: within(form).getByRole('button', { name: 'Create account' }),
  };
}

test('submitting an empty form shows both errors, links them to the fields, and focuses the first', async () => {
  const { user, onSubmit, email, password, submit } = setup();

  await user.click(submit);

  expect(email).toHaveAttribute('aria-invalid', 'true');
  expect(email).toHaveAccessibleDescription('Enter a valid email');
  expect(password).toHaveAttribute('aria-invalid', 'true');
  expect(password).toHaveAccessibleDescription('Password must be at least 8 characters');
  expect(email).toHaveFocus();
  expect(onSubmit).not.toHaveBeenCalled();
});

test('a password input has no textbox role, so it is queried by label', () => {
  const { form, password } = setup();
  expect(within(form).queryByRole('textbox', { name: 'Password' })).toBeNull();
  expect(password).toHaveAttribute('type', 'password');
});

test('only the invalid field is flagged; fixing it and resubmitting calls onSubmit', async () => {
  const { user, onSubmit, form, email, password, submit } = setup();

  await user.type(email, 'ana@');
  await user.type(password, 'correct-horse');
  await user.click(submit);

  expect(within(form).getAllByRole('alert')).toHaveLength(1);
  expect(email).toHaveAccessibleDescription('Enter a valid email');
  expect(password).not.toHaveAttribute('aria-invalid');
  expect(password).not.toHaveAccessibleDescription();
  expect(onSubmit).not.toHaveBeenCalled();

  await user.clear(email);
  await user.type(email, 'ana@example.com');
  await user.click(submit);

  expect(onSubmit).toHaveBeenCalledExactlyOnceWith({ email: 'ana@example.com', password: 'correct-horse' });
  expect(email).not.toHaveAttribute('aria-invalid');
});

test('Enter in a field submits the form (implicit submission) and no error is shown in the form', async () => {
  const { user, onSubmit, form, email, password } = setup();

  await user.type(email, 'ana@example.com');
  await user.type(password, 'correct-horse{Enter}');

  expect(onSubmit).toHaveBeenCalledExactlyOnceWith({ email: 'ana@example.com', password: 'correct-horse' });
  expect(within(form).queryByText(/valid email|at least 8/)).toBeNull();
});

test('validate() is a pure function: unit-test the rules directly', () => {
  expect(validate({ email: 'nope', password: 'short' })).toMatchInlineSnapshot(`
    {
      "email": "Enter a valid email",
      "password": "Password must be at least 8 characters",
    }
  `);
  expect(validate({ email: 'ana@example.com', password: 'long enough' })).toEqual({});
});
