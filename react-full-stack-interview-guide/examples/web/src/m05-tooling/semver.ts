// A small semver range checker, enough to explain what `^`, `~`, x-ranges and `||` mean.
// Not a replacement for the `semver` package (no hyphen ranges, no loose parsing, no coercion).

export type Version = { major: number; minor: number; patch: number; prerelease: string[] };
type Op = '<' | '<=' | '>' | '>=' | '=';
type Comparator = { op: Op; version: Version };

const VERSION_RE = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/;

export function parseVersion(input: string): Version | null {
  const m = VERSION_RE.exec(input.trim());
  if (!m) return null;
  return {
    major: Number(m[1]),
    minor: Number(m[2]),
    patch: Number(m[3]),
    prerelease: m[4] ? m[4].split('.') : [],
  };
}

function compareIdentifiers(a: string, b: string): number {
  const aNum = /^\d+$/.test(a);
  const bNum = /^\d+$/.test(b);
  if (aNum && bNum) return Math.sign(Number(a) - Number(b));
  if (aNum) return -1; // numeric identifiers sort before alphanumeric ones
  if (bNum) return 1;
  return a < b ? -1 : a > b ? 1 : 0;
}

export function compareVersions(a: Version, b: Version): number {
  if (a.major !== b.major) return Math.sign(a.major - b.major);
  if (a.minor !== b.minor) return Math.sign(a.minor - b.minor);
  if (a.patch !== b.patch) return Math.sign(a.patch - b.patch);
  if (a.prerelease.length === 0 && b.prerelease.length === 0) return 0;
  if (a.prerelease.length === 0) return 1; // 1.0.0 > 1.0.0-rc.1
  if (b.prerelease.length === 0) return -1;
  const length = Math.max(a.prerelease.length, b.prerelease.length);
  for (let i = 0; i < length; i++) {
    const x = a.prerelease[i];
    const y = b.prerelease[i];
    if (x === undefined) return -1; // fewer fields sort first
    if (y === undefined) return 1;
    const c = compareIdentifiers(x, y);
    if (c !== 0) return c;
  }
  return 0;
}

type Partial3 = { major: number | null; minor: number | null; patch: number | null; prerelease: string[] };

const PARTIAL_RE = /^(\d+|x|X|\*)(?:\.(\d+|x|X|\*))?(?:\.(\d+|x|X|\*))?(?:-([0-9A-Za-z.-]+))?$/;

function part(raw: string | undefined): number | null {
  return raw === undefined || !/^\d+$/.test(raw) ? null : Number(raw);
}

function parsePartial(text: string): Partial3 | null {
  if (text === '') return { major: null, minor: null, patch: null, prerelease: [] };
  const m = PARTIAL_RE.exec(text);
  if (!m) return null;
  const major = part(m[1]);
  const minor = major === null ? null : part(m[2]); // 1.x.3 is treated as 1.x
  const patch = minor === null ? null : part(m[3]);
  return { major, minor, patch, prerelease: m[4] && patch !== null ? m[4].split('.') : [] };
}

const v = (major: number, minor: number, patch: number, prerelease: string[] = []): Version => ({
  major,
  minor,
  patch,
  prerelease,
});

function expand(op: string, p: Partial3): Comparator[] {
  const { major, minor, patch, prerelease } = p;
  if (major === null) {
    // `*`, `x` or empty: anything. `>*` and `<*` match nothing.
    return op === '>' || op === '<' ? [{ op: '<', version: v(0, 0, 0) }] : [];
  }
  const lo = v(major, minor ?? 0, patch ?? 0, prerelease);
  const nextMajor = v(major + 1, 0, 0);
  const nextMinor = v(major, (minor ?? 0) + 1, 0);
  const full = minor !== null && patch !== null;

  switch (op) {
    case '':
    case '=':
      if (full) return [{ op: '=', version: lo }];
      return [
        { op: '>=', version: lo },
        { op: '<', version: minor === null ? nextMajor : nextMinor },
      ];
    case '>=':
      return [{ op: '>=', version: lo }];
    case '>':
      if (full) return [{ op: '>', version: lo }];
      return [{ op: '>=', version: minor === null ? nextMajor : nextMinor }];
    case '<':
      return [{ op: '<', version: lo }];
    case '<=':
      if (full) return [{ op: '<=', version: lo }];
      return [{ op: '<', version: minor === null ? nextMajor : nextMinor }];
    case '~':
      return [
        { op: '>=', version: lo },
        { op: '<', version: minor === null ? nextMajor : nextMinor },
      ];
    case '^': {
      let upper: Version;
      if (major > 0) upper = nextMajor;
      else if (minor === null) upper = v(1, 0, 0);
      else if (minor > 0) upper = v(0, minor + 1, 0);
      else if (patch === null) upper = v(0, 1, 0);
      else upper = v(0, 0, patch + 1);
      return [
        { op: '>=', version: lo },
        { op: '<', version: upper },
      ];
    }
    default:
      return [];
  }
}

/** Parses a range into OR-ed sets of AND-ed comparators. Throws RangeError when invalid. */
export function parseRange(range: string): Comparator[][] {
  return range.split('||').map((set) => {
    const normalized = set.trim().replace(/(>=|<=|>|<|=|~|\^)\s+/g, '$1');
    const tokens = normalized === '' ? [''] : normalized.split(/\s+/);
    return tokens.flatMap((token) => {
      const m = /^(>=|<=|>|<|=|~|\^)?(.*)$/.exec(token);
      const partial = m ? parsePartial(m[2] ?? '') : null;
      if (!m || !partial) throw new RangeError(`Invalid range "${range}" (bad comparator "${token}")`);
      return expand(m[1] ?? '', partial);
    });
  });
}

function matches(version: Version, { op, version: bound }: Comparator): boolean {
  const c = compareVersions(version, bound);
  switch (op) {
    case '<':
      return c < 0;
    case '<=':
      return c <= 0;
    case '>':
      return c > 0;
    case '>=':
      return c >= 0;
    case '=':
      return c === 0;
  }
}

function sameTuple(a: Version, b: Version): boolean {
  return a.major === b.major && a.minor === b.minor && a.patch === b.patch;
}

/**
 * npm's prerelease rule: 1.3.0-beta.1 only satisfies a comparator set if some comparator in that
 * set names a prerelease of the SAME major.minor.patch. `^1.2.0` therefore never installs betas.
 */
function setMatches(version: Version, set: Comparator[]): boolean {
  if (!set.every((c) => matches(version, c))) return false;
  if (version.prerelease.length === 0) return true;
  return set.some((c) => c.version.prerelease.length > 0 && sameTuple(c.version, version));
}

export function satisfies(versionText: string, range: string): boolean {
  const version = parseVersion(versionText);
  if (!version) return false;
  try {
    return parseRange(range).some((set) => setMatches(version, set));
  } catch {
    return false;
  }
}

/** What `npm install pkg@range` would pick from a list of published versions. */
export function maxSatisfying(versions: readonly string[], range: string): string | null {
  let best: { text: string; parsed: Version } | null = null;
  for (const text of versions) {
    const parsed = parseVersion(text);
    if (!parsed || !satisfies(text, range)) continue;
    if (best === null || compareVersions(parsed, best.parsed) > 0) best = { text, parsed };
  }
  return best?.text ?? null;
}
