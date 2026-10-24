// Exercise 42.2: our authorization server's token endpoint, over the section 4 model (concepts/token-family.ts, which
// rotates and detects reuse as RFC 9700 §4.14.2 describes). It speaks RFC 6749's wire format: a §5.1 success response
// with `expires_in`, or the §5.2 error `invalid_grant`, which hides why the refresh was refused. `now` is an argument.
import type { TokenFamilies, TokenPair } from '../concepts/token-family';

/** RFC 6749 §5.1: a successful token response (the fields this exercise uses). */
export interface TokenResponse {
  readonly access_token: string;
  readonly token_type: 'Bearer';
  /** Lifetime of the access token in seconds, counted from the response. */
  readonly expires_in: number;
  readonly refresh_token: string;
}

/** RFC 6749 §5.2: the error response. Unknown, expired, reused and revoked refresh tokens all look the same. */
export interface TokenError {
  readonly error: 'invalid_grant';
}

export class TokenEndpoint {
  constructor(
    private readonly families: TokenFamilies,
    private readonly accessTokenSeconds: number,
  ) {}

  /** Stands in for the code exchange at login (Exercise 42.1): starts a token family. */
  login(now: number): TokenResponse {
    return this.response(this.families.issue(now));
  }

  /** The refresh token grant (RFC 6749 §6). The refusal reason stays on the server. */
  refresh(refreshToken: string, now: number): TokenResponse | TokenError {
    const result = this.families.refresh(refreshToken, now);
    return result.ok ? this.response(result.tokens) : { error: result.error };
  }

  private response(tokens: TokenPair): TokenResponse {
    return {
      access_token: tokens.accessToken,
      token_type: 'Bearer',
      expires_in: this.accessTokenSeconds,
      refresh_token: tokens.refreshToken,
    };
  }
}
