import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderRouter } from '../renderRouter';
import { createAuthRoutes, type Settings } from './authRoutes';
import type { Session } from './session';

function setup(url: string, session: Session = { user: null }) {
  const loadSettings = vi.fn((): Settings => ({ theme: 'dark' }));
  const rendered = renderRouter(createAuthRoutes({ session, loadSettings }), url);
  return { ...rendered, session, loadSettings };
}

test('a signed-in user sees the layout and the child route inside it', async () => {
  setup('/app/settings', { user: { name: 'Ada' } });
  expect(await screen.findByRole('heading', { name: 'Settings (dark)' })).toBeInTheDocument();
  expect(screen.getByText('Signed in as Ada')).toBeInTheDocument();
});

test('a guest is redirected to /login with the return path, and no protected loader runs', async () => {
  const { router, loadSettings } = setup('/app/settings?tab=profile');

  expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
  expect(router.state.location.pathname).toBe('/login');
  expect(router.state.location.search).toBe('?redirectTo=%2Fapp%2Fsettings%3Ftab%3Dprofile');
  expect(loadSettings).not.toHaveBeenCalled();
});

test('signing in sends the user back to where they were going', async () => {
  const user = userEvent.setup();
  const { router, session } = setup('/app/settings');
  await screen.findByRole('heading', { name: 'Sign in' });

  await user.type(screen.getByLabelText('Name'), 'Grace');
  await user.click(screen.getByRole('button', { name: 'Sign in' }));

  expect(await screen.findByRole('heading', { name: 'Settings (dark)' })).toBeInTheDocument();
  expect(router.state.location.pathname).toBe('/app/settings');
  expect(session.user).toEqual({ name: 'Grace' });
});

test('an empty name is a 400 from the action, shown next to the field', async () => {
  const user = userEvent.setup();
  setup('/login');
  await screen.findByRole('heading', { name: 'Sign in' });

  await user.click(screen.getByRole('button', { name: 'Sign in' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('Enter your name');
  expect(screen.getByLabelText('Name')).toHaveAttribute('aria-invalid', 'true');
});

test('an off-site redirectTo is ignored (no open redirect)', async () => {
  const user = userEvent.setup();
  const { router } = setup('/login?redirectTo=//evil.example/steal');
  await screen.findByRole('heading', { name: 'Sign in' });

  await user.type(screen.getByLabelText('Name'), 'Ada');
  await user.click(screen.getByRole('button', { name: 'Sign in' }));

  expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  expect(router.state.location.pathname).toBe('/app');
});

test('signing out clears the session; the guard then blocks every child of /app', async () => {
  const user = userEvent.setup();
  const { router } = setup('/app', { user: { name: 'Ada' } });
  await screen.findByRole('heading', { name: 'Dashboard' });

  await user.click(screen.getByRole('button', { name: 'Sign out' }));
  expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();

  await user.click(screen.getByRole('link', { name: 'Settings' }));
  expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
  expect(router.state.location.search).toBe('?redirectTo=%2Fapp%2Fsettings');
});
