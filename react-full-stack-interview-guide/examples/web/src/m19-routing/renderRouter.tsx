import { render } from '@testing-library/react';
import { createMemoryRouter, type RouteObject } from 'react-router';
import { RouterProvider } from 'react-router/dom';

/**
 * Module 20.8's custom render, cut down to what route trees need: a fresh in-memory data router
 * per test, started at `initialEntry`. Returns the router so a test can read
 * `router.state.location` or call `router.navigate()`.
 *
 * `RouterProvider` comes from `react-router/dom` (the DOM build that can call `flushSync`), which
 * is what the v7→v8 upgrade guide prescribes for browser apps.
 */
export function renderRouter(routes: RouteObject[], initialEntry = '/') {
  const router = createMemoryRouter(routes, { initialEntries: [initialEntry] });
  const result = render(<RouterProvider router={router} />);
  return { ...result, router };
}

/** Shown while the first loaders run, instead of the "No HydrateFallback" dev warning. */
export function Booting() {
  return <p role="status">Loading…</p>;
}
