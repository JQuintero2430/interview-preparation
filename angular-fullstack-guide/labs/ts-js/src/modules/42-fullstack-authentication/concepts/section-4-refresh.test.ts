// Section 4 claims, about our model (token-family.ts) of RFC 9700 §4.14.2: rotation hands out a new refresh token and
// kills the old one, a used token presented again revokes the whole family whoever presents it, without rotation a copy
// keeps working, and two tabs that refresh under one Web Lock reach the token endpoint once. Token values come from a
// counter; `now` is an argument (no clock, no network). Two simulated tabs in one Node process share Node's
// `navigator.locks`, as same-origin tabs share the browser's lock manager.
import { TokenFamilies, type NewToken, type RefreshResult, type TokenPair } from './token-family';

/** 2026-01-01T00:00:00Z in epoch seconds; every `now` below is an offset from this login. */
const LOGIN_AT = 1_767_225_600;
/** RFC 10017 §6.3.2.3's example: a refresh token that lasts 8 hours. */
const EIGHT_HOURS = 8 * 60 * 60;
const TEN_MINUTES = 10 * 60;

function counter(prefix: string): NewToken {
  let issued = 0;
  return () => `${prefix}-${++issued}`;
}

function rotatingServer(): TokenFamilies {
  return new TokenFamilies({ rotate: true, lifetimeSeconds: EIGHT_HOURS }, counter('t'));
}

/** Unwraps a successful refresh, failing the test with the refusal reason otherwise. */
function tokensOf(result: RefreshResult): TokenPair {
  if (!result.ok) throw new Error(`refresh refused: ${result.reason}`);
  return result.tokens;
}

/** What two tabs of one origin share: the tokens in shared storage (standing in for localStorage) and the endpoint. */
interface SharedSession {
  tokens: TokenPair;
  readonly endpoint: (refreshToken: string) => Promise<RefreshResult>;
}

/**
 * One tab's refresh, serialized across tabs by a Web Lock. Inside the lock the tab compares the stored access token
 * with the one it saw before waiting; if another tab already refreshed, it reuses the result instead of spending the
 * refresh token again (the check angular-auth-oidc-client 22.0.2 makes in its internal refreshWithLock).
 */
async function refreshUnderLock(lockName: string, session: SharedSession): Promise<string> {
  const seenBeforeLock = session.tokens.accessToken;
  return navigator.locks.request(lockName, async () => {
    if (session.tokens.accessToken !== seenBeforeLock) return session.tokens.accessToken;
    session.tokens = tokensOf(await session.endpoint(session.tokens.refreshToken));
    return session.tokens.accessToken;
  });
}

describe('Module 42 · section 4', () => {
  it('Section 4: each refresh returns a new refresh token and the old one stops working', () => {
    const server = rotatingServer();
    const login = server.issue(LOGIN_AT);
    const first = tokensOf(server.refresh(login.refreshToken, LOGIN_AT + TEN_MINUTES));
    const second = tokensOf(server.refresh(first.refreshToken, LOGIN_AT + 2 * TEN_MINUTES));

    expect(new Set([login.refreshToken, first.refreshToken, second.refreshToken]).size).toBe(3);
    expect(server.refresh(login.refreshToken, LOGIN_AT + 3 * TEN_MINUTES)).toMatchObject({
      ok: false,
      error: 'invalid_grant',
    });
  });

  it('Section 4: replaying a used refresh token revokes the whole family', () => {
    // The real client refreshes first, then the attacker replays the copy it stole before that refresh.
    const server = rotatingServer();
    const stolen = server.issue(LOGIN_AT).refreshToken;
    const legitimate = tokensOf(server.refresh(stolen, LOGIN_AT + TEN_MINUTES));
    expect(server.refresh(stolen, LOGIN_AT + 2 * TEN_MINUTES)).toEqual({
      ok: false,
      error: 'invalid_grant',
      reason: 'reused',
    });
    // The server cannot tell who replayed it, so the legitimate client's active token is revoked too.
    expect(server.refresh(legitimate.refreshToken, LOGIN_AT + 3 * TEN_MINUTES)).toMatchObject({ reason: 'revoked' });

    // The other order: the attacker refreshes first and the real client's next refresh is the replay.
    const raced = rotatingServer();
    const copied = raced.issue(LOGIN_AT).refreshToken;
    const attackers = tokensOf(raced.refresh(copied, LOGIN_AT + TEN_MINUTES));
    expect(raced.refresh(copied, LOGIN_AT + 2 * TEN_MINUTES)).toMatchObject({ reason: 'reused' });
    expect(raced.refresh(attackers.refreshToken, LOGIN_AT + 3 * TEN_MINUTES)).toMatchObject({ reason: 'revoked' });

    // Only that login's family ends: another login on the same server still refreshes.
    const otherLogin = raced.issue(LOGIN_AT);
    expect(raced.refresh(otherLogin.refreshToken, LOGIN_AT + 3 * TEN_MINUTES).ok).toBe(true);
  });

  it('Section 4: without rotation a stolen refresh token keeps working beside the real one', () => {
    const server = new TokenFamilies({ rotate: false, lifetimeSeconds: EIGHT_HOURS }, counter('t'));
    const refreshToken = server.issue(LOGIN_AT).refreshToken;

    const legitimate = tokensOf(server.refresh(refreshToken, LOGIN_AT + TEN_MINUTES));
    const attackers = tokensOf(server.refresh(refreshToken, LOGIN_AT + 2 * TEN_MINUTES));
    const legitimateAgain = tokensOf(server.refresh(refreshToken, LOGIN_AT + 3 * TEN_MINUTES));

    // The same refresh token comes back each time, and both parties get fresh access tokens.
    expect([legitimate.refreshToken, attackers.refreshToken, legitimateAgain.refreshToken]).toEqual([
      refreshToken,
      refreshToken,
      refreshToken,
    ]);
    expect(new Set([legitimate.accessToken, attackers.accessToken, legitimateAgain.accessToken]).size).toBe(3);
    // Only the family's lifetime, fixed at login, ends the copy.
    expect(server.refresh(refreshToken, LOGIN_AT + EIGHT_HOURS)).toMatchObject({ reason: 'expired' });
  });

  it('Section 4: two tabs refreshing under one Web Lock make one refresh call', async () => {
    const server = rotatingServer();
    const refreshCalls: string[] = [];
    const session: SharedSession = {
      tokens: server.issue(LOGIN_AT),
      endpoint: async (refreshToken) => {
        refreshCalls.push(refreshToken);
        await Promise.resolve(); // the network round trip, during which the other tab is waiting for the lock
        return server.refresh(refreshToken, LOGIN_AT + TEN_MINUTES);
      },
    };
    const loginRefreshToken = session.tokens.refreshToken;

    const [tabA, tabB] = await Promise.all([
      refreshUnderLock('lab-m42-refresh-two-tabs', session),
      refreshUnderLock('lab-m42-refresh-two-tabs', session),
    ]);

    expect(refreshCalls).toEqual([loginRefreshToken]);
    expect(tabB).toBe(tabA);
    // No refresh token was spent twice, so the family is intact and the stored token still refreshes.
    expect(server.refresh(session.tokens.refreshToken, LOGIN_AT + 2 * TEN_MINUTES).ok).toBe(true);
  });
});
