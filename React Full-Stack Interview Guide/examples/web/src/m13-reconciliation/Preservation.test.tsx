import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  ConditionalSibling,
  DifferentTypeTernary,
  EarlyReturn,
  FragmentToggle,
  KeyToggle,
  ReversibleList,
  SameTypeTernary,
  SeparateSlots,
  WrapperToggle,
} from './Preservation';

// Each test types "hello" into the field, flips the toggle, then checks what the field holds.
async function typeThenToggle(label = 'Name') {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(label), 'hello');
  await user.click(screen.getByRole('button', { name: 'Toggle' }));
  return user;
}

test('1. same type at the same position: state is preserved, even though props changed', async () => {
  render(<SameTypeTernary />);
  await typeThenToggle('Shipping');
  expect(screen.getByLabelText('Billing')).toHaveValue('hello');
});

test('2. a different type at the same position: state is reset, even with identical markup', async () => {
  render(<DifferentTypeTernary />);
  await typeThenToggle();
  expect(screen.getByLabelText('Name')).toHaveValue('');
});

test('3. wrapping the field in a <div>: state is reset', async () => {
  render(<WrapperToggle />);
  await typeThenToggle();
  expect(screen.getByLabelText('Name')).toHaveValue('');
});

test('4. changing the key: state is reset', async () => {
  render(<KeyToggle />);
  await typeThenToggle();
  expect(screen.getByLabelText('Name')).toHaveValue('');
});

test('5. a conditional sibling rendered before it with &&: state is preserved', async () => {
  render(<ConditionalSibling />);
  await typeThenToggle();
  expect(screen.getByText('Welcome back!')).toBeInTheDocument();
  expect(screen.getByLabelText('Name')).toHaveValue('hello');
});

test('6. two separate conditional slots: state is reset', async () => {
  render(<SeparateSlots />);
  await typeThenToggle();
  expect(screen.getByLabelText('Name')).toHaveValue('');
});

test('7. two return statements with the same tree shape: state is preserved', async () => {
  render(<EarlyReturn />);
  await typeThenToggle();
  expect(screen.getByText('Now with a footer')).toBeInTheDocument();
  expect(screen.getByLabelText('Name')).toHaveValue('hello');
});

test('8. a top-level unkeyed Fragment around the field: state is preserved', async () => {
  render(<FragmentToggle />);
  await typeThenToggle();
  expect(screen.getByLabelText('Name')).toHaveValue('hello');
});

test('9a. reversing a list keyed by name: the state moves with its item', async () => {
  const user = userEvent.setup();
  render(<ReversibleList keyBy="name" />);
  await user.type(screen.getByLabelText('Ada'), 'hello');
  await user.click(screen.getByRole('button', { name: 'Reverse' }));
  expect(screen.getByLabelText('Ada')).toHaveValue('hello');
  expect(screen.getByLabelText('Grace')).toHaveValue('');
});

test('9b. reversing a list keyed by index: the state stays at its position', async () => {
  const user = userEvent.setup();
  render(<ReversibleList keyBy="index" />);
  await user.type(screen.getByLabelText('Ada'), 'hello');
  await user.click(screen.getByRole('button', { name: 'Reverse' }));
  expect(screen.getByLabelText('Grace')).toHaveValue('hello');
  expect(screen.getByLabelText('Ada')).toHaveValue('');
});
