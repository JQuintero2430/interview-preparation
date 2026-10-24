// Section 5 model: Spring Security 7.1.1's JwtGrantedAuthoritiesConverter as a function. Our model, not Spring's code.
// Defaults (fact F15): the first claim present of `scope`, then `scp`; a string is split on one space, a list is
// taken as it is, anything else gives nothing; each value gets the prefix `SCOPE_`. Naming a claim replaces both
// defaults, as `setAuthoritiesClaimName` does. Spring's delimiter is a regular expression; ours is plain text.

export interface AuthorityMapping {
  readonly claimNames: readonly string[];
  readonly prefix: string;
  readonly delimiter: string;
}

export const SCOPE_MAPPING: AuthorityMapping = { claimNames: ['scope', 'scp'], prefix: 'SCOPE_', delimiter: ' ' };

function valuesOf(claim: unknown, delimiter: string): readonly string[] {
  if (typeof claim === 'string') return claim.trim() === '' ? [] : claim.split(delimiter);
  if (Array.isArray(claim)) return claim.filter((value): value is string => typeof value === 'string');
  return [];
}

/** The authorities a verified token's claims grant under `mapping`, in claim order. */
export function authoritiesFrom(claims: Readonly<Record<string, unknown>>, mapping = SCOPE_MAPPING): string[] {
  const name = mapping.claimNames.find((claimName) => Object.hasOwn(claims, claimName));
  const values: readonly string[] = name === undefined ? [] : valuesOf(claims[name], mapping.delimiter);
  return values.map((value) => `${mapping.prefix}${value}`);
}
