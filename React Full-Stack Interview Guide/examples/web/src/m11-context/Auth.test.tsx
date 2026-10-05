import { memo, useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, AuthStatus, RequireAuth, useAuth } from './Auth';

test('signing in and out updates every consumer', async () => {
  const user = userEvent.setup();
  render(
    <AuthProvider>
      <AuthStatus />
      <RequireAuth>
        <p>Secret dashboard</p>
      </RequireAuth>
    </AuthProvider>,
  );
  expect(screen.getByRole('alert')).toHaveTextContent('Please sign in');
  expect(screen.queryByText('Secret dashboard')).not.toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Sign in as Ada' }));
  expect(screen.getByText(/Signed in as Ada/)).toBeInTheDocument();
  expect(screen.getByText('Secret dashboard')).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Sign out' }));
  expect(screen.getByRole('button', { name: 'Sign in as Ada' })).toBeInTheDocument();
  expect(screen.queryByText('Secret dashboard')).not.toBeInTheDocument();
});

test('the guarded hook throws a helpful error outside the provider', () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  expect(() => render(<AuthStatus />)).toThrow('useAuth must be used inside <AuthProvider>');
  error.mockRestore();
});

const renders: string[] = [];

const UserName = memo(function UserName() {
  const { user } = useAuth();
  renders.push(user?.name ?? 'anonymous');
  return <p>{user?.name ?? 'anonymous'}</p>;
});

function Shell() {
  const [clicks, setClicks] = useState(0);
  return (
    <AuthProvider initialUser={{ name: 'Grace' }}>
      <button type="button" onClick={() => setClicks((c) => c + 1)}>
        Clicked {clicks}
      </button>
      <UserName />
    </AuthProvider>
  );
}

test('the memoized value keeps memo() consumers from re-rendering on unrelated parent renders', async () => {
  const user = userEvent.setup();
  renders.length = 0;
  render(<Shell />);
  expect(renders).toEqual(['Grace']);

  await user.click(screen.getByRole('button', { name: 'Clicked 0' }));
  expect(screen.getByRole('button', { name: 'Clicked 1' })).toBeInTheDocument();
  // AuthProvider re-rendered, but useMemo returned the same value object, so memo(UserName) bailed out.
  expect(renders).toEqual(['Grace']);
});
