// Exercise 44.3: the half both variants share: our flag types, tokens, the safe evaluation and an in-memory provider.
// Our code, not OpenFeature's. The types mirror, all read 2026-10-22: `@openfeature/core` 1.12.0 (`ResolutionDetails`,
// `StandardResolutionReasons`, `ErrorCode`) and `@openfeature/web-sdk` 1.10.0's client error path (a thrown error
// becomes the caller's default value, reason `ERROR` and the error's `code`, or `GENERAL` when it has none).
// `changes$` stands for the provider's configuration-changed event and its `flagsChanged` list. Angular cannot import
// labs/ts-js, so section 8's bucket hash (ours: FNV-1a with a final mix) is re-implemented here.
import { InjectionToken, type Signal } from '@angular/core';
import { type Observable, Subject } from 'rxjs';

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
  readonly targetingKey?: string;
}

export interface ResolutionDetails<T> {
  readonly value: T;
  readonly variant?: string;
  readonly reason: Reason;
  readonly errorCode?: ErrorCode;
}

/** A boolean flag: named variants, the variant everyone gets, and an optional percentage that gets another one. */
export interface FlagDefinition {
  readonly variants: Readonly<Record<string, boolean>>;
  readonly defaultVariant: string;
  readonly disabled: boolean;
  readonly rollout?: { readonly percent: number; readonly variant: string };
}

/** What a provider must offer: a synchronous resolution (the static-context paradigm) and the keys that changed. */
export interface FlagProvider {
  resolveBoolean(key: string, defaultValue: boolean, context: EvaluationContext): ResolutionDetails<boolean>;
  readonly changes$: Observable<readonly string[]>;
}

/** What components read; both variants implement it. */
export interface FlagReader {
  details(key: string, defaultValue: boolean): Signal<ResolutionDetails<boolean>>;
  flag(key: string, defaultValue: boolean): Signal<boolean>;
  setContext(context: EvaluationContext): void;
}

export const FLAG_PROVIDER = new InjectionToken<FlagProvider>('FLAG_PROVIDER');
export const FLAGS = new InjectionToken<FlagReader>('FLAGS');

/** An error a provider throws with one of the standard codes. */
export class FlagError extends Error {
  constructor(
    readonly code: ErrorCode,
    message: string,
  ) {
    super(message);
  }
}

/** Never throws: a failure is the caller's default value with reason ERROR and a code. */
export function evaluateBoolean(
  provider: FlagProvider,
  key: string,
  defaultValue: boolean,
  context: EvaluationContext,
): ResolutionDetails<boolean> {
  try {
    return provider.resolveBoolean(key, defaultValue, context);
  } catch (error: unknown) {
    return { value: defaultValue, reason: 'ERROR', errorCode: error instanceof FlagError ? error.code : 'GENERAL' };
  }
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

function serve(flag: FlagDefinition, variant: string, reason: Reason, defaultValue: boolean): ResolutionDetails<boolean> {
  return { value: flag.variants[variant] ?? defaultValue, variant, reason };
}

/** Our provider: definitions in memory, a sticky bucket per targeting key, and `update` as the kill switch. */
export class MemoryFlagProvider implements FlagProvider {
  private readonly changed = new Subject<readonly string[]>();
  private flags: Readonly<Record<string, FlagDefinition>>;

  readonly changes$ = this.changed.asObservable();

  constructor(flags: Readonly<Record<string, FlagDefinition>>) {
    this.flags = flags;
  }

  /** Replaces one definition and reports its key, without a deploy or a reload. */
  update(key: string, definition: FlagDefinition): void {
    this.flags = { ...this.flags, [key]: definition };
    this.changed.next([key]);
  }

  resolveBoolean(key: string, defaultValue: boolean, context: EvaluationContext): ResolutionDetails<boolean> {
    const flag: FlagDefinition | undefined = this.flags[key];
    if (flag === undefined) throw new FlagError('FLAG_NOT_FOUND', `no flag named ${key}`);
    if (flag.disabled) return { value: defaultValue, reason: 'DISABLED' };
    if (flag.rollout === undefined) return serve(flag, flag.defaultVariant, 'STATIC', defaultValue);
    if (context.targetingKey === undefined) throw new FlagError('TARGETING_KEY_MISSING', `${key} needs a targeting key`);
    const inside = bucketOf(key, context.targetingKey) < flag.rollout.percent * (BUCKETS / 100);
    return serve(flag, inside ? flag.rollout.variant : flag.defaultVariant, 'SPLIT', defaultValue);
  }
}
