import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CodeInput } from './CodeInput';

const input = () => screen.getByLabelText('Code');

test('fireEvent.change sets the value directly: no focus, no key events, maxLength ignored', () => {
  render(<CodeInput />);

  fireEvent.change(input(), { target: { value: 'ABCDEF' } });

  expect(input()).toHaveValue('ABCDEF');
  expect(input()).not.toHaveFocus();
  expect(screen.getByText('Key presses: 0')).toBeInTheDocument();
});

test('user.type behaves like a person: focuses, presses each key, respects maxLength', async () => {
  const user = userEvent.setup();
  render(<CodeInput />);

  await user.type(input(), 'ABCDEF');

  expect(input()).toHaveValue('ABCD');
  expect(input()).toHaveFocus();
  expect(screen.getByText('Key presses: 6')).toBeInTheDocument();
});

test('a disabled field: user.type changes nothing, fireEvent.change still does', async () => {
  const user = userEvent.setup();
  render(<CodeInput disabled />);

  await user.type(input(), 'AB');
  expect(input()).toHaveValue('');

  fireEvent.change(input(), { target: { value: 'AB' } });
  expect(input()).toHaveValue('AB');
});
