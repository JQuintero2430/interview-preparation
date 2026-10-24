// Exercise 42.2, variant a: one in-flight refresh promise, shared by every caller of this client (one tab). A second
// client, even over the same store, has its own promise, so two tabs can spend the same refresh token twice.
import { refreshStored, validAccessToken } from '../refresh-client';
import type { ClientDeps, RefreshClient } from '../refresh-client';

export function createSingleFlightClient(deps: ClientDeps): RefreshClient {
  let inFlight: Promise<string | undefined> | undefined;

  function accessToken(now: number): Promise<string | undefined> {
    const valid = validAccessToken(deps.store, now);
    if (valid !== undefined) return Promise.resolve(valid);
    inFlight ??= refreshStored(deps, now).finally(() => {
      inFlight = undefined;
    });
    return inFlight;
  }

  return { accessToken };
}
