import { satisfies } from './range';

/** What the evaluation needs from one `npm view <pkg>@<version> … --json` record. */
export interface PackageFacts {
  readonly name: string;
  readonly version: string;
  readonly corePeer: string | undefined;
  readonly license: string;
  /** Publish time of `version`, from the registry's `time[<version>]` field. */
  readonly publishedAt: Date;
  /** The day the record was read (`_readAt`); the rules measure age from it, so a test never depends on today. */
  readonly readAt: Date;
}

/** The team's policy, as data. */
export interface Rules {
  readonly angularVersion: string;
  readonly licenseAllowList: readonly string[];
  readonly maxMonthsSincePublish: number;
}

export interface Finding {
  readonly rule: string;
  readonly message: string;
}

interface Rule {
  readonly id: string;
  readonly check: (pkg: PackageFacts, rules: Rules) => string | null;
}

const CORE = '@angular/core';

function monthsBefore(date: Date, months: number): Date {
  const result = new Date(date.getTime());
  result.setUTCMonth(result.getUTCMonth() - months);
  return result;
}

/**
 * The evaluation rule table, checked in order. Each rule returns a message when the package breaks it, or null.
 * A package with no `@angular/core` peer is not an Angular library, so the peer rule does not apply to it.
 */
export const RULE_TABLE: readonly Rule[] = [
  {
    id: 'peer-range',
    check: (pkg, rules) =>
      pkg.corePeer === undefined || satisfies(rules.angularVersion, pkg.corePeer)
        ? null
        : `${CORE} peer "${pkg.corePeer}" excludes ${rules.angularVersion}`,
  },
  {
    id: 'license',
    check: (pkg, rules) =>
      rules.licenseAllowList.includes(pkg.license) ? null : `license "${pkg.license}" is not on the allow-list`,
  },
  {
    id: 'last-publish',
    check: (pkg, rules) =>
      pkg.publishedAt >= monthsBefore(pkg.readAt, rules.maxMonthsSincePublish)
        ? null
        : `${pkg.version} was published ${pkg.publishedAt.toISOString().slice(0, 10)}, more than ${rules.maxMonthsSincePublish} months before ${pkg.readAt.toISOString().slice(0, 10)}`,
  },
];

/** Runs every rule of the table on one package and returns the findings in table order (empty when it passes). */
export function evaluate(pkg: PackageFacts, rules: Rules): Finding[] {
  return RULE_TABLE.flatMap((rule) => {
    const message = rule.check(pkg, rules);
    return message === null ? [] : [{ rule: rule.id, message }];
  });
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

/** Normalizes a recorded `npm view <pkg>@<version> name version peerDependencies license 'time[<version>]' --json` record. */
export function fromNpmView(record: unknown): PackageFacts {
  if (typeof record !== 'object' || record === null) throw new Error('registry record is not an object');
  const version = stringField(record, 'version');
  return {
    name: stringField(record, 'name'),
    version,
    corePeer: corePeerOf(record),
    license: stringField(record, 'license'),
    publishedAt: new Date(stringField(record, `time[${version}]`)),
    readAt: new Date(`${stringField(record, '_readAt')}T00:00:00Z`),
  };
}
