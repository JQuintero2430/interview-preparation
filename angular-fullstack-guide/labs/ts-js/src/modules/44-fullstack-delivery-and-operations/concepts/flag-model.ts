// Section 8 model: which variant a flag gives a user, what an evaluation returns when it fails, and which release a
// canary router picks. Our model, not OpenFeature's or Nginx's code. It mirrors, all read 2026-10-22: the shapes of
// `@openfeature/core` 1.12.0 (`ResolutionDetails`, `StandardResolutionReasons`, `ErrorCode`) and the error path of
// `@openfeature/web-sdk` 1.10.0's client (a failed evaluation returns the caller's default value, reason `ERROR` and an
// error code), the OpenFeature specification's flag-evaluation requirement 1.4.10 (calls return the default value on
// abnormal execution), and nginx.org's `split_clients` (a hash of one string picks a share of traffic, no state is
// stored). The hash is ours (FNV-1a with a final mix), not Nginx's MurmurHash2. Not modeled: contexts beyond the
// targeting key, hooks, events, non-boolean flags. Nothing here reads a clock or a random source.

export type Reason =
  | 'STATIC'
  | 'DEFAULT'
  | 'TARGETING_MATCH'
  | 'SPLIT'
  | 'CACHED'
  | 'DISABLED'
  | 'UNKNOWN'
  | 'STALE'
  | 'ERROR';

export type ErrorCode =
  | 'PROVIDER_NOT_READY'
  | 'PROVIDER_FATAL'
  | 'FLAG_NOT_FOUND'
  | 'PARSE_ERROR'
  | 'TYPE_MISMATCH'
  | 'TARGETING_KEY_MISSING'
  | 'INVALID_CONTEXT'
  | 'GENERAL';

export interface EvaluationContext {
  targetingKey?: string;
}

/** A boolean flag: named variants, the variant everyone gets, and an optional percentage that gets another one. */
export interface FlagDefinition {
  variants: Record<string, boolean>;
  defaultVariant: string;
  disabled?: boolean;
  rollout?: { percent: number; variant: string };
}

export interface Details {
  flagKey: string;
  value: boolean;
  variant?: string;
  reason: Reason;
  errorCode?: ErrorCode;
}

/** Buckets per hundred percent: 10,000 gives a 0.01% step. */
export const BUCKETS = 10_000;

function hash32(text: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index++) {
    hash = Math.imul(hash ^ text.charCodeAt(index), 0x01000193);
  }
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x85ebca6b);
  hash ^= hash >>> 13;
  hash = Math.imul(hash, 0xc2b2ae35);
  return (hash ^ (hash >>> 16)) >>> 0;
}

/** The user's bucket for one flag: the flag key is part of the hash, so two flags split the same users differently. */
export function bucketOf(flagKey: string, targetingKey: string): number {
  return hash32(`${flagKey}\u0000${targetingKey}`) % BUCKETS;
}

function failure(flagKey: string, defaultValue: boolean, errorCode: ErrorCode): Details {
  return { flagKey, value: defaultValue, reason: 'ERROR', errorCode };
}

/** Resolves one flag; every failure returns the caller's default value with reason ERROR and an error code. */
export function evaluate(
  flags: Readonly<Record<string, FlagDefinition>>,
  providerReady: boolean,
  flagKey: string,
  defaultValue: boolean,
  context: EvaluationContext,
): Details {
  const flag = flags[flagKey];
  if (!providerReady) return failure(flagKey, defaultValue, 'PROVIDER_NOT_READY');
  if (flag === undefined) return failure(flagKey, defaultValue, 'FLAG_NOT_FOUND');
  if (flag.disabled) return { flagKey, value: defaultValue, reason: 'DISABLED' };
  if (flag.rollout === undefined) {
    const variant = flag.defaultVariant;
    return { flagKey, value: flag.variants[variant] ?? defaultValue, variant, reason: 'STATIC' };
  }
  if (context.targetingKey === undefined) return failure(flagKey, defaultValue, 'TARGETING_KEY_MISSING');
  const inside = bucketOf(flagKey, context.targetingKey) < flag.rollout.percent * (BUCKETS / 100);
  const chosen = inside ? flag.rollout.variant : flag.defaultVariant;
  return { flagKey, value: flag.variants[chosen] ?? defaultValue, variant: chosen, reason: 'SPLIT' };
}

export type Release = 'v1' | 'v2';

export interface RouteRequest {
  clientId: string;
  requestId: string;
  cookie?: Release;
}

export interface Routed {
  release: Release;
  setCookie?: Release;
}

/** Picks a release: sticky hashes the client and then trusts the cookie; non-sticky hashes every request on its own. */
export function route(request: RouteRequest, canaryPercent: number, sticky: boolean): Routed {
  if (sticky && request.cookie !== undefined) return { release: request.cookie };
  const key = sticky ? request.clientId : `${request.clientId}/${request.requestId}`;
  const release: Release = bucketOf('canary', key) < canaryPercent * (BUCKETS / 100) ? 'v2' : 'v1';
  return sticky ? { release, setCookie: release } : { release };
}

export type ReleaseFiles = Readonly<Record<Release, ReadonlySet<string>>>;

/** What a release's server answers: a path it does not hold is a 404, as a hashed file that is gone is (section 3). */
export function answer(files: ReleaseFiles, release: Release, path: string): 200 | 404 {
  return files[release].has(path) ? 200 : 404;
}

/** The files a new release serves when it keeps the previous release's hashed files for tabs that still ask. */
export function withOldChunks(newFiles: ReadonlySet<string>, oldFiles: ReadonlySet<string>): ReadonlySet<string> {
  return new Set([...oldFiles, ...newFiles]);
}
