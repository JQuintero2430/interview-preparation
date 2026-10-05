import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { MockInstance } from 'vitest';
import { Bomb, messageOf } from './Bomb';
import { ErrorBoundary } from './ErrorBoundary';

// React logs every caught render error with console.error in development. Silence it, and
// assert on it where the log itself is the point.
let consoleError: MockInstance<typeof console.error>;
beforeEach(() => {
  consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

test('shows the fallback instead of the subtree that threw; content outside the boundary survives', () => {
  render(
    <>
      <h1>Shell</h1>
      <ErrorBoundary fallback={<p role="alert">Something went wrong</p>}>
        <Bomb message="render boom" />
      </ErrorBoundary>
    </>,
  );
  expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
  expect(screen.getByRole('heading', { name: 'Shell' })).toBeInTheDocument();
});

test('componentDidCatch receives the error and a component stack that names the thrower', () => {
  const onError = vi.fn();
  render(
    <ErrorBoundary fallback={<p>Oops</p>} onError={onError}>
      <Bomb message="render boom" />
    </ErrorBoundary>,
  );
  expect(onError).toHaveBeenCalledTimes(1);
  const [error, info] = onError.mock.calls[0] ?? [];
  expect(messageOf(error)).toBe('render boom');
  expect(info.componentStack).toContain('Bomb');
});

test('React 19 dev logs a caught error ONCE, naming the component and the boundary', () => {
  render(
    <ErrorBoundary fallback={<p>Oops</p>}>
      <Bomb message="render boom" />
    </ErrorBoundary>,
  );
  expect(consoleError).toHaveBeenCalledTimes(1);
  expect(consoleError).toHaveBeenCalledWith(
    '%o\n\n%s\n\n%s\n',
    expect.any(Error),
    'The above error occurred in the <Bomb> component.',
    'React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary.',
  );
});

test('React 19: a caught render error does NOT reach window "error" listeners (React 18 dev did)', () => {
  const onWindowError = vi.fn((event: ErrorEvent) => event.preventDefault());
  window.addEventListener('error', onWindowError);
  try {
    render(
      <ErrorBoundary fallback={<p>Oops</p>}>
        <Bomb />
      </ErrorBoundary>,
    );
  } finally {
    window.removeEventListener('error', onWindowError);
  }
  expect(onWindowError).not.toHaveBeenCalled();
});

test('an error thrown in an event handler bypasses the boundary and goes to window "error"', async () => {
  const user = userEvent.setup();
  const seen: string[] = [];
  // Without a listener of our own, Vitest would report the window error as an unhandled error.
  const onWindowError = (event: ErrorEvent) => {
    event.preventDefault();
    seen.push(messageOf(event.error));
  };
  window.addEventListener('error', onWindowError);
  try {
    render(
      <ErrorBoundary fallback={<p role="alert">Oops</p>}>
        <button
          type="button"
          onClick={() => {
            throw new Error('click boom');
          }}
        >
          Pay
        </button>
      </ErrorBoundary>,
    );
    await user.click(screen.getByRole('button', { name: 'Pay' }));
  } finally {
    window.removeEventListener('error', onWindowError);
  }
  expect(seen).toEqual(['click boom']);
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Pay' })).toBeInTheDocument();
});
