import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserPage } from '../UserPage';
import { createTestQueryClient, renderWithProviders } from './render';
import { ada, server } from './server';

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const userRoute = { path: '/users/:userId' } as const;

test('the route param from the memory router drives the request', async () => {
  renderWithProviders(<UserPage />, { ...userRoute, route: '/users/2' });
  expect(await screen.findByRole('heading', { name: 'Alan Turing' })).toBeInTheDocument();
});

test('a Link navigates inside the memory router; the test can assert the location', async () => {
  const user = userEvent.setup();
  const { router } = renderWithProviders(<UserPage />, {
    ...userRoute,
    route: '/users/1',
    routes: [{ path: '/', element: <h1>Directory</h1> }],
  });
  await screen.findByRole('heading', { name: 'Ada Lovelace' });

  await user.click(screen.getByRole('link', { name: 'All users' }));

  expect(await screen.findByRole('heading', { name: 'Directory', level: 1 })).toBeInTheDocument();
  expect(router.state.location.pathname).toBe('/');
});

test('a seeded cache renders synchronously, then refetches in the background', async () => {
  const queryClient = createTestQueryClient();
  queryClient.setQueryData(['user', '1'], { ...ada, name: 'Ada (cached)' });

  renderWithProviders(<UserPage />, { ...userRoute, route: '/users/1', queryClient });

  // No await: the data is already in the cache, so the first render shows it.
  expect(screen.getByRole('heading', { name: 'Ada (cached)' })).toBeInTheDocument();
  // The seeded entry is stale (staleTime 0), so the query refetches and the server's value replaces it.
  expect(await screen.findByRole('heading', { name: 'Ada Lovelace' })).toBeInTheDocument();
});

test('each render gets a fresh client: nothing leaks from the previous test', () => {
  renderWithProviders(<UserPage />, { ...userRoute, route: '/users/1' });
  expect(screen.getByRole('status')).toHaveTextContent('Loading user…');
});
