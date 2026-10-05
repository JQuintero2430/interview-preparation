import type { ReactElement, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router';

/** A fresh client per test: no shared cache, and no retries (the default 3 retries with backoff would time out error tests). */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

type ProviderOptions = Omit<RenderOptions, 'wrapper'> & {
  /** The URL the memory router starts at, e.g. '/users/1'. */
  route?: string;
  /** The route pattern `ui` is mounted at, e.g. '/users/:userId'. */
  path?: string;
  /** Other routes the test can navigate to. */
  routes?: RouteObject[];
  /** Pass one in to seed or inspect the cache. */
  queryClient?: QueryClient;
};

/**
 * Renders `ui` inside the same providers the app uses: a QueryClient and a data router held in memory.
 * Returns RTL's render result plus the router and client, so a test can assert on the location or the cache.
 */
export function renderWithProviders(
  ui: ReactElement,
  { route = '/', path = '/', routes = [], queryClient = createTestQueryClient(), ...options }: ProviderOptions = {},
) {
  const router = createMemoryRouter([{ path, element: ui }, ...routes], { initialEntries: [route] });
  const result = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
    options,
  );
  return { ...result, router, queryClient };
}

/** A `wrapper` for render/renderHook when only the QueryClient is needed. */
export function createWrapper(queryClient: QueryClient = createTestQueryClient()) {
  return function QueryWrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}
