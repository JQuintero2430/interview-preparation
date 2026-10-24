// Exercise 42.1, variant a: the pending request waits in a key-value store under its `state`, the way a page survives
// the redirect in `sessionStorage`. Each tab has its own store, so two logins can be in flight at once.
import { createOidcClient } from '../oidc-client';
import type { ClientDeps, KeyValueStore, OidcClient, PendingRequest, PendingStore } from '../oidc-client';

const KEY_PREFIX = 'oidc.pending.';

function isPending(value: unknown): value is PendingRequest {
  if (typeof value !== 'object' || value === null) return false;
  return (
    'state' in value &&
    typeof value.state === 'string' &&
    'nonce' in value &&
    typeof value.nonce === 'string' &&
    'verifier' in value &&
    typeof value.verifier === 'string'
  );
}

export function createClientA(deps: ClientDeps & { readonly store: KeyValueStore }): OidcClient {
  const { store } = deps;
  const pending: PendingStore = {
    save: (request) => store.setItem(KEY_PREFIX + request.state, JSON.stringify(request)),
    take(state) {
      const raw = store.getItem(KEY_PREFIX + state);
      if (raw === null) return undefined;
      store.removeItem(KEY_PREFIX + state);
      const parsed: unknown = JSON.parse(raw);
      return isPending(parsed) ? parsed : undefined;
    },
  };
  return createOidcClient(deps, pending);
}
