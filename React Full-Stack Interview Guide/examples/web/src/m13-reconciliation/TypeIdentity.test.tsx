import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StableCounter, makeCounter } from './TypeIdentity';

test('the same type on every render keeps its state and its DOM node', async () => {
  const user = userEvent.setup();
  const { rerender } = render(<StableCounter />);
  const before = screen.getByRole('button');
  await user.click(before);
  rerender(<StableCounter />);
  expect(screen.getByRole('button')).toHaveTextContent('Clicked 1');
  expect(screen.getByRole('button')).toBe(before);
});

test('a new type on every render (what an inline component definition does) resets state and DOM', async () => {
  const user = userEvent.setup();
  const First = makeCounter();
  const { rerender } = render(<First />);
  const before = screen.getByRole('button');
  await user.click(before);

  const Second = makeCounter(); // same source code, different function object
  rerender(<Second />);
  expect(screen.getByRole('button')).toHaveTextContent('Clicked 0');
  expect(screen.getByRole('button')).not.toBe(before);
});

test('two calls of the factory produce types that are not equal', () => {
  expect(makeCounter()).not.toBe(makeCounter());
});
