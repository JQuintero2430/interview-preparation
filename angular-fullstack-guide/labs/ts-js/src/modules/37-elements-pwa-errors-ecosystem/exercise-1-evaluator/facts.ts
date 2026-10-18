import { type Rules } from './rules';

/** What the evaluation needs from one recorded `npm view <pkg>@<version> … --json` record. */
export interface PackageFacts {
  readonly name: string;
  readonly version: string;
  /** The `@angular/core` entry of `peerDependencies`; undefined when the package declares none. */
  readonly corePeer: string | undefined;
  readonly license: string;
  /** Publish time of `version`, from the registry's `time[<version>]` field. */
  readonly publishedAt: Date;
  /** True when the package.json has an `exports` field. */
  readonly hasExports: boolean;
  /** True when the package.json has a `sideEffects` field (a boolean or a list of files). */
  readonly hasSideEffects: boolean;
}

export interface Finding {
  readonly rule: string;
  readonly message: string;
}

/** The two variants share this signature: the evaluation date is an argument, never `Date.now()`. */
export type Evaluate = (pkg: PackageFacts, rules: Rules, today: Date) => Finding[];

export const CORE = '@angular/core';

/** The first instant that still counts as "within `months` months before `date`". */
export function monthsBefore(date: Date, months: number): Date {
  const result = new Date(date.getTime());
  result.setUTCMonth(result.getUTCMonth() - months);
  return result;
}

export function day(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function stringField(record: object, key: string): string {
  const value: unknown = Reflect.get(record, key);
  if (typeof value !== 'string') throw new Error(`registry record has no string "${key}"`);
  return value;
}

function corePeerOf(record: object): string | undefined {
  const peers: unknown = Reflect.get(record, 'peerDependencies');
  if (typeof peers !== 'object' || peers === null) return undefined;
  const range: unknown = Reflect.get(peers, CORE);
  return typeof range === 'string' ? range : undefined;
}

/** Normalizes a recorded record; the `_readAt` and `_command` fields are for the reader, not for the rules. */
export function fromNpmView(record: unknown): PackageFacts {
  if (typeof record !== 'object' || record === null) throw new Error('registry record is not an object');
  const version = stringField(record, 'version');
  return {
    name: stringField(record, 'name'),
    version,
    corePeer: corePeerOf(record),
    license: stringField(record, 'license'),
    publishedAt: new Date(stringField(record, `time[${version}]`)),
    hasExports: Reflect.get(record, 'exports') !== undefined,
    hasSideEffects: Reflect.get(record, 'sideEffects') !== undefined,
  };
}
