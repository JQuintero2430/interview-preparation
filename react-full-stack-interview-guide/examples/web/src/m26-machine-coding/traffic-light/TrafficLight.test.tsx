import { act, fireEvent, render, screen } from '@testing-library/react';
import { TrafficLight } from './TrafficLight';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

const advance = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });
const status = () => screen.getByRole('status');

test('starts on red', () => {
  render(<TrafficLight />);
  expect(status()).toHaveTextContent('Light: red');
});

test('follows red 4s -> green 3s -> yellow 1s -> red, switching exactly on the boundary', () => {
  render(<TrafficLight />);

  advance(3999);
  expect(status()).toHaveTextContent('red');
  advance(1);
  expect(status()).toHaveTextContent('green');

  advance(3000);
  expect(status()).toHaveTextContent('yellow');
  advance(1000);
  expect(status()).toHaveTextContent('red');
});

test('exactly one lamp is lit', () => {
  const { container } = render(<TrafficLight />);
  expect(container.querySelectorAll('[data-lit="true"]')).toHaveLength(1);
  expect(container.querySelector('[data-color="red"]')).toHaveAttribute('data-lit', 'true');
});

test('accepts a custom cycle', () => {
  render(<TrafficLight cycle={{ red: { next: 'yellow', ms: 10 }, yellow: { next: 'green', ms: 10 }, green: { next: 'red', ms: 10 } }} />);
  advance(10);
  expect(status()).toHaveTextContent('yellow');
});

test('Pause freezes the light and Resume continues the cycle', () => {
  render(<TrafficLight />);
  fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
  advance(60_000);
  expect(status()).toHaveTextContent('red');
  expect(vi.getTimerCount()).toBe(0);

  fireEvent.click(screen.getByRole('button', { name: 'Resume' }));
  advance(4000);
  expect(status()).toHaveTextContent('green');
});

test('unmounting cancels the pending timeout', () => {
  const { unmount } = render(<TrafficLight />);
  expect(vi.getTimerCount()).toBe(1);
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});
