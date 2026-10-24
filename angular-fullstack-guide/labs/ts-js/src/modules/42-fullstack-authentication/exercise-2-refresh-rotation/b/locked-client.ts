// Exercise 42.2, variant b: refreshes run under a Web Lock (`navigator.locks`), which every same-origin tab shares. Inside
// the lock the client reads the store again: if a caller in this tab or another one already refreshed, it uses that
// token instead of spending the refresh token a second time. That re-check needs a store the tabs share.
import { refreshStored, validAccessToken } from '../refresh-client';
import type { ClientDeps, RefreshClient } from '../refresh-client';

export function createLockedClient(deps: ClientDeps, lockName: string): RefreshClient {
  async function accessToken(now: number): Promise<string | undefined> {
    const valid = validAccessToken(deps.store, now);
    if (valid !== undefined) return valid;
    return navigator.locks.request(lockName, async () => validAccessToken(deps.store, now) ?? refreshStored(deps, now));
  }

  return { accessToken };
}
