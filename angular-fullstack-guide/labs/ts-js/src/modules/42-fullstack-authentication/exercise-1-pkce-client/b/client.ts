// Exercise 42.1, variant b: one pending request in memory. A second `begin()` replaces the first, so the first login's
// callback fails the `state` check, and a full page reload loses the request.
import { createOidcClient } from '../oidc-client';
import type { ClientDeps, OidcClient, PendingRequest, PendingStore } from '../oidc-client';

export function createClientB(deps: ClientDeps): OidcClient {
  let current: PendingRequest | undefined;
  const pending: PendingStore = {
    save: (request) => {
      current = request;
    },
    take(state) {
      if (current?.state !== state) return undefined;
      const taken = current;
      current = undefined;
      return taken;
    },
  };
  return createOidcClient(deps, pending);
}
