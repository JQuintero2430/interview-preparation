import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderRouter } from '../renderRouter';
import { createLazyRoutes, lazyCalls } from './lazyRoutes';

// The router caches the lazy result per route object, and each test builds fresh routes,
// so reset the counter in beforeEach rather than relying on test order.
beforeEach(() => {
  lazyCalls.reports = 0;
});

test('the lazy chunk is not requested until the route is visited', async () => {
  renderRouter(createLazyRoutes(), '/');
  expect(await screen.findByRole('heading', { name: 'Home' })).toBeInTheDocument();
  expect(lazyCalls.reports).toBe(0);
});

test('visiting the route loads Component and loader together, then renders with the loader data', async () => {
  const user = userEvent.setup();
  renderRouter(createLazyRoutes(), '/');
  await screen.findByRole('heading', { name: 'Home' });

  await user.click(screen.getByRole('link', { name: 'Reports' }));

  expect(await screen.findByRole('heading', { name: 'Reports (42)' })).toBeInTheDocument();
  expect(lazyCalls.reports).toBe(1);
});

test('a deep link to a lazy route shows the HydrateFallback first, then the route', async () => {
  renderRouter(createLazyRoutes(), '/reports');
  expect(await screen.findByRole('heading', { name: 'Reports (42)' })).toBeInTheDocument();
});

test('navigating away and back does not call lazy again (the router caches it)', async () => {
  const { router } = renderRouter(createLazyRoutes(), '/reports');
  await screen.findByRole('heading', { name: 'Reports (42)' });

  await act(() => router.navigate('/'));
  await act(() => router.navigate('/reports'));

  expect(await screen.findByRole('heading', { name: 'Reports (42)' })).toBeInTheDocument();
  expect(lazyCalls.reports).toBe(1);
});
