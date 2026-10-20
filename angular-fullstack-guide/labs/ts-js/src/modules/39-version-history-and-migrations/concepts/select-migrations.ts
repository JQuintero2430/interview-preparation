// Our selector, mirroring executeMigrations (internal) in @angular/cli 22.2.1, src/commands/update/utilities/migration.js,
// read 2026-10-19, not run. It is ours, not the CLI's: no `semver` package (the comparison follows semver 7.8.5's
// compareMain, comparePre and compareIdentifiers), no schematic engine, no prompt and no coercion of short versions
// (the CLI turns `22` or `22.0` into `22.0.0` first; a version that is not `x.y.z[-pre]` is skipped here).

/** One entry of a migration collection's `schematics` map, as `ng update` reads it. */
export interface MigrationEntry {
  readonly name: string;
  readonly version: string;
  readonly optional?: boolean;
  readonly recommended?: boolean;
  readonly hidden?: boolean;
  readonly private?: boolean;
}

/** What our selector returns: the required names in run order, then the optional ones as the prompt would list them. */
export interface Selection {
  readonly required: string[];
  readonly optional: { readonly name: string; readonly checked: boolean }[];
}

interface Version {
  readonly main: readonly [number, number, number];
  readonly pre: readonly string[];
}

const versionPattern = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/;

function parseVersion(text: string): Version | undefined {
  const match = versionPattern.exec(text);
  if (!match) return undefined;
  const [, major = '0', minor = '0', patch = '0', pre] = match;
  return { main: [Number(major), Number(minor), Number(patch)], pre: pre === undefined ? [] : pre.split('.') };
}

// semver's compareIdentifiers: numeric identifiers compare as numbers and sort before alphanumeric ones.
function compareIdentifiers(a: string, b: string): number {
  const aNumeric = /^\d+$/.test(a);
  const bNumeric = /^\d+$/.test(b);
  if (aNumeric && bNumeric) return Math.sign(Number(a) - Number(b));
  if (aNumeric !== bNumeric) return aNumeric ? -1 : 1;
  return compareText(a, b);
}

function compareText(a: string, b: string): number {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

// semver's comparePre: a version without a prerelease is greater; otherwise identifier by identifier, shorter first.
function comparePre(a: readonly string[], b: readonly string[]): number {
  if (a.length === 0 && b.length === 0) return 0;
  if (a.length === 0) return 1;
  if (b.length === 0) return -1;
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const left = a[i];
    const right = b[i];
    if (left === undefined) return -1;
    if (right === undefined) return 1;
    const difference = compareIdentifiers(left, right);
    if (difference !== 0) return difference;
  }
  return 0;
}

function compare(a: Version, b: Version): number {
  for (let i = 0; i < 3; i++) {
    const difference = (a.main[i] ?? 0) - (b.main[i] ?? 0);
    if (difference !== 0) return Math.sign(difference);
  }
  return comparePre(a.pre, b.pre);
}

function mustParse(text: string): Version {
  const version = parseVersion(text);
  if (version === undefined) throw new Error(`not a version: ${text}`);
  return version;
}

/** The range `>from <=to`: a prerelease `from` becomes `<base>-0`, and `to` loses its prerelease (as in migration.js). */
export function inMigrationRange(versionText: string, from: string, to: string): boolean {
  const version = parseVersion(versionText);
  if (version === undefined) return false;
  const fromVersion = mustParse(from);
  const lower: Version = fromVersion.pre.length > 0 ? { main: fromVersion.main, pre: ['0'] } : fromVersion;
  const upper: Version = { main: mustParse(to).main, pre: [] };
  // includePrerelease: true, so a prerelease version needs no prerelease bound with the same major.minor.patch
  return compare(version, lower) > 0 && compare(version, upper) <= 0;
}

function byVersion(a: MigrationEntry, b: MigrationEntry): number {
  return compare(mustParse(a.version), mustParse(b.version));
}

/**
 * Selects the migrations `ng update` would run for one package moving from `from` to `to`.
 * 1. Names as the schematic engine lists them: hidden and private entries left out, sorted by name.
 * 2. Keep the entries whose version is in `>from <=to`.
 * 3. Split by `optional`, then sort each list by version; ties keep the name order (the sort is stable).
 */
export function selectMigrations(entries: readonly MigrationEntry[], from: string, to: string): Selection {
  const listed = entries.filter((entry) => !entry.hidden && !entry.private).sort((a, b) => compareText(a.name, b.name));
  const matching = listed.filter((entry) => inMigrationRange(entry.version, from, to));
  const required = matching.filter((entry) => !entry.optional).sort(byVersion);
  const optional = matching.filter((entry) => entry.optional === true).sort(byVersion);
  return {
    required: required.map((entry) => entry.name),
    optional: optional.map((entry) => ({ name: entry.name, checked: entry.recommended === true })),
  };
}
