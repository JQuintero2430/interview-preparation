// Exercise 42.2: six criteria, each run over both variants (a: one in-flight promise per client; b: a Web Lock shared
// by every client of the origin). The server is our token endpoint over the section 4 model, with rotation on; token
// values come from a counter, the network is an async function that records each refresh token it carries, and `now`
// is passed in (no clock). Two clients over one store stand in for two tabs over shared storage, and they share Node's
// `navigator.locks` as same-origin tabs share the browser's.
import { createSingleFlightClient } from './a/single-flight-client';
import { createLockedClient } from './b/locked-client';
import { storedTokens } from './refresh-client';
import type { RefreshClient, RefreshGrant, StoredTokens, TokenStore } from './refresh-client';
import { TokenEndpoint } from './token-endpoint';
import { TokenFamilies, type NewToken } from '../concepts/token-family';

type Variant = 'a' | 'b';

/** 2026-01-01T00:00:00Z in epoch seconds; every `now` below is an offset from this login. */
const LOGIN_AT = 1_767_225_600;
const FIVE_MINUTES = 5 * 60;
const EIGHT_HOURS = 8 * 60 * 60;
/** The login's access token has just expired. */
const FIRST_EXPIRY = LOGIN_AT + FIVE_MINUTES;
/** The access token from the first refresh has just expired. */
const SECOND_EXPIRY = FIRST_EXPIRY + FIVE_MINUTES;

/** Two tabs over one store: variant a has a promise per tab, so both refresh; variant b's lock lets one refresh. */
const TWO_CLIENT_REFRESH_CALLS: Readonly<Record<Variant, number>> = { a: 2, b: 1 };

function counter(prefix: string): NewToken {
  let issued = 0;
  return () => `${prefix}-${++issued}`;
}

function memoryStore(initial: StoredTokens): TokenStore {
  let tokens: StoredTokens | undefined = initial;
  return {
    read: () => tokens,
    write: (next) => {
      tokens = next;
    },
  };
}

interface Rig {
  readonly server: TokenEndpoint;
  readonly store: TokenStore;
  /** Every refresh token the network carried to the server, in order. */
  readonly sent: string[];
  /** A new client (a tab) over the shared store and network. */
  readonly newClient: () => RefreshClient;
}

let rigs = 0;

function createRig(variant: Variant): Rig {
  const families = new TokenFamilies({ rotate: true, lifetimeSeconds: EIGHT_HOURS }, counter('t'));
  const server = new TokenEndpoint(families, FIVE_MINUTES);
  const store = memoryStore(storedTokens(server.login(LOGIN_AT), LOGIN_AT));
  const sent: string[] = [];
  const refresh: RefreshGrant = async (refreshToken, now) => {
    sent.push(refreshToken);
    await Promise.resolve(); // the round trip, during which other callers run
    return server.refresh(refreshToken, now);
  };
  const lockName = `lab-m42-exercise-2-${++rigs}`;
  const newClient = (): RefreshClient =>
    variant === 'a' ? createSingleFlightClient({ store, refresh }) : createLockedClient({ store, refresh }, lockName);
  return { server, store, sent, newClient };
}

describe.each<Variant>(['a', 'b'])('Exercise 42.2, variant %s', (variant) => {
  it('returns the cached access token without a refresh while it is valid', async () => {
    const rig = createRig(variant);
    const client = rig.newClient();
    const loginAccessToken = rig.store.read()?.accessToken;

    expect(await client.accessToken(FIRST_EXPIRY - 1)).toBe(loginAccessToken);
    expect(rig.sent).toEqual([]);
  });

  it('makes one refresh call for five concurrent callers when the token has expired', async () => {
    const rig = createRig(variant);
    const client = rig.newClient();

    const tokens = await Promise.all(Array.from({ length: 5 }, () => client.accessToken(FIRST_EXPIRY)));

    expect(rig.sent).toHaveLength(1);
    expect(new Set(tokens).size).toBe(1);
    expect(tokens[0]).toBe(rig.store.read()?.accessToken);
  });

  it('stores the rotated refresh token and never sends the old one again', async () => {
    const rig = createRig(variant);
    const client = rig.newClient();
    const loginRefreshToken = rig.store.read()?.refreshToken;

    await client.accessToken(FIRST_EXPIRY);
    const rotated = rig.store.read()?.refreshToken;
    await client.accessToken(SECOND_EXPIRY);

    expect(rotated).not.toBe(loginRefreshToken);
    expect(rig.sent).toEqual([loginRefreshToken, rotated]);
    expect(rig.store.read()?.refreshToken).not.toBe(rotated);
  });

  it('treats `invalid_grant` as signed out instead of retrying', async () => {
    const rig = createRig(variant);
    const client = rig.newClient();
    // The family's lifetime, fixed at login, is over: the server answers `invalid_grant`.
    const familyEnd = LOGIN_AT + EIGHT_HOURS;

    expect(await client.accessToken(familyEnd)).toBeUndefined();
    expect(rig.store.read()).toBeUndefined();
    expect(await client.accessToken(familyEnd + 1)).toBeUndefined();
    expect(rig.sent).toHaveLength(1);
  });

  it('a replayed old refresh token revokes the family, so the next legitimate refresh fails too', async () => {
    const rig = createRig(variant);
    const client = rig.newClient();
    const stolen = rig.store.read()?.refreshToken ?? ''; // copied by injected script before the app refreshes

    expect(await client.accessToken(FIRST_EXPIRY)).toBeDefined();
    expect(rig.server.refresh(stolen, FIRST_EXPIRY + 60)).toEqual({ error: 'invalid_grant' });
    expect(await client.accessToken(SECOND_EXPIRY)).toBeUndefined();
    expect(rig.store.read()).toBeUndefined();
  });

  it('two clients sharing one store make one refresh call between them', async () => {
    const rig = createRig(variant);
    const loginRefreshToken = rig.store.read()?.refreshToken;
    const [tabA, tabB] = [rig.newClient(), rig.newClient()];

    const [tokenA, tokenB] = await Promise.all([tabA.accessToken(FIRST_EXPIRY), tabB.accessToken(FIRST_EXPIRY)]);

    expect(rig.sent).toHaveLength(TWO_CLIENT_REFRESH_CALLS[variant]);
    // Only the login's refresh token was ever sent: in variant a the second call is a replay.
    expect(new Set(rig.sent)).toEqual(new Set([loginRefreshToken]));
    expect(tokenA).toBeDefined();
    // a: the replay revoked the family and signed the second tab out; b: the second tab reused the first tab's token.
    expect(tokenB).toBe(variant === 'a' ? undefined : tokenA);
  });
});
