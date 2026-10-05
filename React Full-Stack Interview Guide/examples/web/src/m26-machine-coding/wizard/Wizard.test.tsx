import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Wizard, validate } from './Wizard';

test('validate is a pure per-step function', () => {
  expect(validate(0, { email: 'nope', name: '' })).toEqual({ email: 'Enter a valid email' });
  expect(validate(0, { email: 'a@b.co', name: '' })).toEqual({});
  expect(validate(1, { email: '', name: '  ' })).toEqual({ name: 'Name is required' });
  expect(validate(2, { email: '', name: '' })).toEqual({});
});

test('Next is blocked by an invalid step and shows the error', async () => {
  const user = userEvent.setup();
  render(<Wizard onSubmit={vi.fn()} />);

  await user.click(screen.getByRole('button', { name: 'Next' }));

  expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid email');
  expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
});

test('the error disappears once the field becomes valid', async () => {
  const user = userEvent.setup();
  render(<Wizard onSubmit={vi.fn()} />);
  await user.click(screen.getByRole('button', { name: 'Next' }));
  await user.type(screen.getByLabelText('Email'), 'ada@example.com');
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('walks through the steps, keeps values when going back, and submits them', async () => {
  const onSubmit = vi.fn();
  const user = userEvent.setup();
  render(<Wizard onSubmit={onSubmit} />);

  await user.type(screen.getByLabelText('Email'), 'ada@example.com');
  await user.click(screen.getByRole('button', { name: 'Next' }));
  expect(screen.getByRole('heading', { name: 'Profile' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();

  await user.type(screen.getByLabelText('Name'), 'Ada');
  await user.click(screen.getByRole('button', { name: 'Back' }));
  expect(screen.getByLabelText('Email')).toHaveValue('ada@example.com');

  await user.click(screen.getByRole('button', { name: 'Next' }));
  expect(screen.getByLabelText('Name')).toHaveValue('Ada');
  await user.click(screen.getByRole('button', { name: 'Next' }));

  expect(screen.getByRole('heading', { name: 'Review' })).toBeInTheDocument();
  expect(screen.getByText('ada@example.com')).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(onSubmit).toHaveBeenCalledTimes(1);
  expect(onSubmit).toHaveBeenCalledWith({ email: 'ada@example.com', name: 'Ada' });
  expect(screen.getByRole('status')).toHaveTextContent('Thanks, Ada!');
});

test('Enter in a field advances like the Next button', async () => {
  const user = userEvent.setup();
  render(<Wizard onSubmit={vi.fn()} />);
  await user.type(screen.getByLabelText('Email'), 'ada@example.com{Enter}');
  expect(screen.getByRole('heading', { name: 'Profile' })).toBeInTheDocument();
});

test('Back is disabled on the first step', () => {
  render(<Wizard onSubmit={vi.fn()} />);
  expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();
});
