import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { UserProfile } from './UserProfile';
import { createWrapper } from './test-utils/render';
import { ada, server, USER_URL } from './test-utils/server';

// 'error' makes a request with no handler fail the test instead of reaching the real network.
beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
// Drop the per-test overrides added with server.use(), keeping the happy-path handlers.
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const renderProfile = (userId: string) => render(<UserProfile userId={userId} />, { wrapper: createWrapper() });

test('shows a loading status, then the user', async () => {
  renderProfile('1');

  expect(screen.getByRole('status')).toHaveTextContent('Loading user…');
  expect(await screen.findByRole('heading', { name: 'Ada Lovelace' })).toBeInTheDocument();
  expect(screen.getByText('ada@example.test')).toBeInTheDocument();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});

test('a server error renders the error state (per-test override with server.use)', async () => {
  server.use(http.get(USER_URL, () => new HttpResponse(null, { status: 500 })));
  renderProfile('1');

  expect(await screen.findByRole('alert')).toHaveTextContent('Could not load user: HTTP 500');
  expect(screen.queryByRole('heading')).not.toBeInTheDocument();
});

test('a 404 from the default handler is an error too', async () => {
  renderProfile('999');
  expect(await screen.findByRole('alert')).toHaveTextContent('Could not load user: HTTP 404');
});

test('a network failure (no HTTP response at all) is shown, not swallowed', async () => {
  server.use(http.get(USER_URL, () => HttpResponse.error()));
  renderProfile('1');
  expect(await screen.findByRole('alert')).toHaveTextContent(/Could not load user/);
});

test('Retry recovers: the override answers once, then the default handler takes over', async () => {
  const user = userEvent.setup();
  server.use(http.get(USER_URL, () => new HttpResponse(null, { status: 503 }), { once: true }));
  renderProfile('1');

  const alert = await screen.findByRole('alert');
  expect(alert).toHaveTextContent('HTTP 503');

  await user.click(screen.getByRole('button', { name: 'Retry' }));

  expect(await screen.findByRole('heading', { name: 'Ada Lovelace' })).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('two profiles for the same user share one request (the cache deduplicates)', async () => {
  let requests = 0;
  server.use(
    http.get(USER_URL, () => {
      requests += 1;
      return HttpResponse.json(ada);
    }),
  );

  render(
    <>
      <UserProfile userId="1" />
      <UserProfile userId="1" />
    </>,
    { wrapper: createWrapper() },
  );

  expect(await screen.findAllByRole('heading', { name: 'Ada Lovelace' })).toHaveLength(2);
  expect(requests).toBe(1);
});
