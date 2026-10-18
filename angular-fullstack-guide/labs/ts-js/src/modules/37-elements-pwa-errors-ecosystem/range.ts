/**
 * A minimal peer-range matcher for release versions (no prerelease tags, no `semver` package).
 * Supports `||` (OR), spaces (AND), `^`, `~`, `>=`, `>`, `<=`, `<`, `=`, exact versions and `x` / `*` wildcards.
 * Anything else throws, so an unsupported range is never silently treated as a match.
 */
type Triple = readonly [number, number, number];

/** A version written with 1 to 3 parts; a missing or `x` part is `undefined`. */
interface Partial3 {
  readonly major: number | undefined;
  readonly minor: number | undefined;
  readonly patch: number | undefined;
}

type Test = (version: Triple) => boolean;

const ANY: Test = () => true;
const PART = /^(?:\d+|x|X|\*)$/;

function compare(a: Triple, b: Triple): number {
  return a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
}

function toNumber(part: string | undefined): number | undefined {
  if (part === undefined || part === 'x' || part === 'X' || part === '*') return undefined;
  return Number(part);
}

function parsePartial(text: string): Partial3 {
  const parts = text.split('.');
  if (text === '' || parts.length > 3 || !parts.every((part) => PART.test(part))) {
    throw new Error(`unsupported version "${text}"`);
  }
  return { major: toNumber(parts[0]), minor: toNumber(parts[1]), patch: toNumber(parts[2]) };
}

/** Parses a full release version such as `22.2.1`. */
export function parseVersion(text: string): Triple {
  const { major, minor, patch } = parsePartial(text);
  if (major === undefined || minor === undefined || patch === undefined) {
    throw new Error(`not a full version "${text}"`);
  }
  return [major, minor, patch];
}

function floor(v: Partial3): Triple {
  return [v.major ?? 0, v.minor ?? 0, v.patch ?? 0];
}

/** The first version above everything `v` covers (`22.x` → 23.0.0, `22.1` → 22.2.0, `22.1.3` → 22.1.4). */
function next(v: Partial3): Triple {
  if (v.minor === undefined) return [(v.major ?? 0) + 1, 0, 0];
  if (v.patch === undefined) return [v.major ?? 0, v.minor + 1, 0];
  return [v.major ?? 0, v.minor, v.patch + 1];
}

function between(low: Triple, high: Triple): Test {
  return (version) => compare(version, low) >= 0 && compare(version, high) < 0;
}

/** `^` allows changes that do not modify the left-most non-zero part. */
function caret(v: Partial3): Test {
  const low = floor(v);
  if (low[0] > 0 || v.minor === undefined) return between(low, [low[0] + 1, 0, 0]);
  if (low[1] > 0 || v.patch === undefined) return between(low, [0, low[1] + 1, 0]);
  return between(low, [0, 0, low[2] + 1]);
}

/** `~` allows patch changes when a minor is given, minor changes otherwise. */
function tilde(v: Partial3): Test {
  const low = floor(v);
  return v.minor === undefined ? between(low, [low[0] + 1, 0, 0]) : between(low, [low[0], low[1] + 1, 0]);
}

const OPERATORS: Readonly<Record<string, (v: Partial3) => Test>> = {
  '^': caret,
  '~': tilde,
  '>=': (v) => (version) => compare(version, floor(v)) >= 0,
  '>': (v) => (version) => compare(version, next(v)) >= 0,
  '<': (v) => (version) => compare(version, floor(v)) < 0,
  '<=': (v) => (version) => compare(version, next(v)) < 0,
  '=': (v) => between(floor(v), next(v)),
};

const COMPARATOR = /^(\^|~|>=|>|<=|<|=)?(.*)$/;

function comparator(text: string): Test {
  if (text === '*' || text === 'x' || text === 'X') return ANY;
  const match = COMPARATOR.exec(text);
  const operator = OPERATORS[match?.[1] ?? '='];
  if (!match || !operator) throw new Error(`unsupported comparator "${text}"`);
  return operator(parsePartial(match[2] ?? ''));
}

/** One `||` branch: comparators separated by spaces must all hold. `>= 14.x` is read as `>=14.x`. */
function branch(text: string): Test {
  const tokens = text.trim().replace(/(\^|~|>=|>|<=|<|=)\s+/g, '$1').split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return ANY;
  const tests = tokens.map(comparator);
  return (version) => tests.every((test) => test(version));
}

/** True when `version` (a full release version) is inside `range`. */
export function satisfies(version: string, range: string): boolean {
  const parsed = parseVersion(version);
  return range.split('||').some((part) => branch(part)(parsed));
}
