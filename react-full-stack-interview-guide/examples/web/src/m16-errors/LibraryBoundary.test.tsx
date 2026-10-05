import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getErrorMessage } from 'react-error-boundary';
import { messageOf } from './Bomb';
import { SafeProfile, type ProfileService } from './LibraryBoundary';

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

function makeService(failing: Set<string>): ProfileService {
  return {
    getName(userId) {
      if (failing.has(userId)) throw new Error(`user ${userId} unavailable`);
      return `User ${userId}`;
    },
  };
}

test('renders the FallbackComponent and calls onError with a component stack', () => {
  const onError = vi.fn();
  render(<SafeProfile userId="1" service={makeService(new Set(['1']))} onError={onError} />);

  expect(screen.getByRole('alert')).toHaveTextContent('Could not load the profile: user 1 unavailable');
  expect(onError).toHaveBeenCalledTimes(1);
  const [error, info] = onError.mock.calls[0] ?? [];
  expect(messageOf(error)).toBe('user 1 unavailable');
  expect(info.componentStack).toContain('Profile');
});

test('resetErrorBoundary retries the render', async () => {
  const user = userEvent.setup();
  const failing = new Set(['1']);
  render(<SafeProfile userId="1" service={makeService(failing)} />);

  failing.clear();
  await user.click(screen.getByRole('button', { name: 'Try again' }));

  expect(screen.getByRole('heading', { name: 'User 1' })).toBeInTheDocument();
});

test('resetKeys: navigating to another user clears the error', () => {
  const service = makeService(new Set(['1']));
  const { rerender } = render(<SafeProfile userId="1" service={service} />);
  expect(screen.getByRole('alert')).toBeInTheDocument();

  rerender(<SafeProfile userId="2" service={service} />);

  expect(screen.getByRole('heading', { name: 'User 2' })).toBeInTheDocument();
});

test('getErrorMessage handles any thrown value (6.1+)', () => {
  expect(getErrorMessage(new Error('x'))).toBe('x');
  expect(getErrorMessage('plain string')).toBe('plain string');
  expect(getErrorMessage({ message: 'error-like' })).toBe('error-like');
  expect(getErrorMessage(42)).toBeUndefined();
});
