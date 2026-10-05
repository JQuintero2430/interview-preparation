import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';

/**
 * A fresh client per test: no shared cache between tests, no retries (a failing request
 * fails at once instead of after ~7 s of backoff), and no garbage-collection timers left running.
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false, gcTime: Infinity },
    },
  });
}

/** A `wrapper` for `render`/`renderHook`. `rerender` keeps the same client, so the cache survives. */
export function createWrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

export function renderWithClient(ui: ReactElement, client: QueryClient = createTestQueryClient()) {
  return { client, ...render(ui, { wrapper: createWrapper(client) }) };
}
