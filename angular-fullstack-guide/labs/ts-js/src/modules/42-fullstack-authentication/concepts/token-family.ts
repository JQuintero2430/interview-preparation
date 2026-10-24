// Section 4 model: an authorization server's refresh tokens, with rotation and reuse detection.
// Our model, not Spring's code. It mirrors RFC 9700 §4.14.2, "Refresh token rotation" (fact F5): every refresh issues
// a new refresh token, "the previous refresh token is invalidated, but information about the relationship is retained",
// and when an invalidated one is presented the server "will revoke the active refresh token". Each login starts one
// family, whose lifetime is fixed at login and never extended by rotation (RFC 10017 §6.3.2.3). Spring Authorization
// Server 7.1.1 behaves differently (facts F11-F13, C6): see section 4. `now` (epoch seconds) and the token source are
// arguments: no clock, no randomness.

/** Source of opaque token values, injected so that a test can use a counter. A real server needs unguessable ones. */
export type NewToken = () => string;

export interface TokenPair {
  readonly accessToken: string;
  readonly refreshToken: string;
}

/** Why a refresh was refused. On the wire every case is the same RFC 6749 §5.2 error, `invalid_grant`. */
export type RefusalReason = 'unknown' | 'expired' | 'reused' | 'revoked';

export type RefreshResult =
  | { readonly ok: true; readonly tokens: TokenPair }
  | { readonly ok: false; readonly error: 'invalid_grant'; readonly reason: RefusalReason };

export interface TokenFamilyOptions {
  /** `true`: a new refresh token on every use. `false`: the same one comes back each time (no rotation). */
  readonly rotate: boolean;
  /** The family's absolute lifetime in seconds, counted from login. */
  readonly lifetimeSeconds: number;
}

/** One login's refresh tokens: the one that still works, and the end of the family's life. */
interface Family {
  active: string;
  revoked: boolean;
  readonly expiresAt: number;
}

function refused(reason: RefusalReason): RefreshResult {
  return { ok: false, error: 'invalid_grant', reason };
}

/** The authorization server's side: every refresh token it ever issued points at its family, used ones included. */
export class TokenFamilies {
  private readonly familyOf = new Map<string, Family>();

  constructor(
    private readonly options: TokenFamilyOptions,
    private readonly newToken: NewToken,
  ) {}

  /** The code exchange at login: starts a family with its first refresh token. */
  issue(now: number): TokenPair {
    const family: Family = { active: this.newToken(), revoked: false, expiresAt: now + this.options.lifetimeSeconds };
    this.familyOf.set(family.active, family);
    return { accessToken: this.newToken(), refreshToken: family.active };
  }

  /** The refresh token grant. A used token presented again revokes the family: the server cannot tell who sent it. */
  refresh(refreshToken: string, now: number): RefreshResult {
    const family = this.familyOf.get(refreshToken);
    if (family === undefined) return refused('unknown');
    if (family.revoked) return refused('revoked');
    if (now >= family.expiresAt) return refused('expired');
    if (refreshToken !== family.active) {
      family.revoked = true;
      return refused('reused');
    }
    if (this.options.rotate) {
      family.active = this.newToken();
      this.familyOf.set(family.active, family);
    }
    return { ok: true, tokens: { accessToken: this.newToken(), refreshToken: family.active } };
  }
}
