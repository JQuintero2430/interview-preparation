import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { Booting, renderRouter } from '../renderRouter';
import { RequireAuth } from './RequireAuth';

test('declarative mode: the guard renders the page for a user and redirects a guest', () => {
  const { unmount } = render(
    <MemoryRouter initialEntries={['/reports']}>
      <Routes>
        <Route path="/login" element={<h1>Sign in</h1>} />
        <Route
          path="/reports"
          element={
            <RequireAuth user={{ name: 'Ada' }}>
              <h1>Reports</h1>
            </RequireAuth>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
  expect(screen.getByRole('heading', { name: 'Reports' })).toBeInTheDocument();
  unmount();

  render(
    <MemoryRouter initialEntries={['/reports']}>
      <Routes>
        <Route path="/login" element={<h1>Sign in</h1>} />
        <Route
          path="/reports"
          element={
            <RequireAuth user={null}>
              <h1>Reports</h1>
            </RequireAuth>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
  expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
});

test('data router: a component guard redirects only AFTER the protected loader has run', async () => {
  const reportsLoader = vi.fn(() => ({ secret: 'Q3 revenue' }));
  const { router } = renderRouter(
    [
      { path: '/login', element: <h1>Sign in</h1> },
      {
        path: '/reports',
        loader: reportsLoader,
        HydrateFallback: Booting,
        element: (
          <RequireAuth user={null}>
            <h1>Reports</h1>
          </RequireAuth>
        ),
      },
    ],
    '/reports',
  );

  expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
  expect(router.state.location.pathname).toBe('/login');
  // The data was fetched for a user who was never allowed to see it.
  expect(reportsLoader).toHaveBeenCalledTimes(1);
});
