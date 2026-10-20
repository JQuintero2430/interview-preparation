// A minimal range check, ours (not npm's `semver`): it handles only the forms the compatibility fixture uses.
// A comparator is `>=x.y.z`, `<x.y.z`, `^x.y.z` or `~x.y.z`; spaces join comparators (AND); `||` separates sets (OR).
// Every major is above zero, so `^` is "same major, at or above".
export type Version = readonly [number, number, number];

export function parseVersion(text: string): Version {
  const [major = 0, minor = 0, patch = 0] = text.split('.').map(Number);
  return [major, minor, patch];
}

export function compare(a: Version, b: Version): number {
  return a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
}

type Test = (version: Version, bound: Version) => boolean;

// `>=` comes before `<` and `^` is tested by prefix, so each comparator matches exactly one entry.
const operators: readonly (readonly [string, Test])[] = [
  ['>=', (v, b) => compare(v, b) >= 0],
  ['<', (v, b) => compare(v, b) < 0],
  ['^', (v, b) => compare(v, b) >= 0 && v[0] === b[0]],
  ['~', (v, b) => compare(v, b) >= 0 && v[0] === b[0] && v[1] === b[1]],
];

function holds(version: Version, comparator: string): boolean {
  const entry = operators.find(([prefix]) => comparator.startsWith(prefix));
  if (entry === undefined) throw new Error(`our range check does not handle "${comparator}"`);
  const [prefix, test] = entry;
  return test(version, parseVersion(comparator.slice(prefix.length)));
}

/** Whether `version` (for example `18.19.1`) satisfies `range` (for example `^18.13.0 || ^20.9.0`). */
export function satisfies(version: string, range: string): boolean {
  const parsed = parseVersion(version);
  return range.split('||').some((set) => set.trim().split(/\s+/).every((comparator) => holds(parsed, comparator)));
}
