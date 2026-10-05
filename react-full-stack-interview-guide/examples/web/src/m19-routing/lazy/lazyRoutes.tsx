import { Link, Outlet, type RouteObject } from 'react-router';
import { Booting } from '../renderRouter';

function Layout() {
  return (
    <>
      <nav aria-label="Main">
        <Link to="/">Home</Link> <Link to="/reports">Reports</Link>
      </nav>
      <Outlet />
    </>
  );
}

/** Counts how often the lazy function ran: the router calls it once per route, then caches the result. */
export const lazyCalls = { reports: 0 };

/**
 * `lazy` returns the route's non-matching properties (Component, loader, action, ErrorBoundary…).
 * The bundler turns the dynamic import() into a separate chunk. Matching (`path`, `children`)
 * stays in the main bundle so the router can match a URL without downloading anything.
 */
export function createLazyRoutes(): RouteObject[] {
  return [
    {
      path: '/',
      Component: Layout,
      HydrateFallback: Booting,
      children: [
        { index: true, element: <h1>Home</h1> },
        {
          path: 'reports',
          lazy: () => {
            lazyCalls.reports += 1;
            return import('./reportsRoute');
          },
        },
      ],
    },
  ];
}
