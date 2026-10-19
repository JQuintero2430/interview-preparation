// Section 8 claims, on our own code: a tiny hop planner and a tiny range check, both written here and both ours (they are
// not the CLI's or npm's). The data is fixtures/compat-table.ts, rows 13.0.x to 22.0.x copied from angular.dev
// "Version compatibility" (read 2026-10-18). The tests read no installed package and no clock, and call no network, git, npm or ng.
import { compatTable, type CompatRow } from '../fixtures/compat-table';

type Version = readonly [number, number, number];

function parseVersion(text: string): Version {
  const [major = 0, minor = 0, patch = 0] = text.split('.').map(Number);
  return [major, minor, patch];
}

function compare(a: Version, b: Version): number {
  for (let i = 0; i < 3; i++) {
    const difference = (a[i] ?? 0) - (b[i] ?? 0);
    if (difference !== 0) return difference;
  }
  return 0;
}

// One comparator set: `^x.y.z`, `~x.y.z`, `>=x.y.z`, `<x.y.z`, joined by spaces (an AND); `||` separates sets (an OR).
// Only the forms that appear in the fixture are handled, and every major is above zero.
function fitsSet(version: Version, set: string): boolean {
  return set
    .trim()
    .split(/\s+/)
    .every((comparator) => {
      const operator = comparator.startsWith('>=') ? '>=' : comparator[0];
      const bound = parseVersion(comparator.slice(operator === '>=' ? 2 : 1));
      switch (operator) {
        case '^':
          return compare(version, bound) >= 0 && version[0] === bound[0];
        case '~':
          return compare(version, bound) >= 0 && version[0] === bound[0] && version[1] === bound[1];
        case '>=':
          return compare(version, bound) >= 0;
        case '<':
          return compare(version, bound) < 0;
        default:
          throw new Error(`our range check does not handle "${comparator}"`);
      }
    });
}

function fits(versionText: string, range: string): boolean {
  const version = parseVersion(versionText);
  return range.split('||').some((set) => fitsSet(version, set));
}

interface Hop {
  readonly from: number;
  readonly to: number;
  readonly row: CompatRow;
}

// One hop per major: from + 1, from + 2, ... to. A hop carries the compatibility row of its target major.
function planHops(from: number, to: number): Hop[] {
  const hops: Hop[] = [];
  for (let major = from + 1; major <= to; major++) {
    const row = compatTable.find((candidate) => candidate.major === major);
    if (row === undefined) throw new Error(`the fixture has no row for ${major}.0.x`);
    hops.push({ from: major - 1, to: major, row });
  }
  return hops;
}

describe('Module 39 · section 8', () => {
  it('Section 8: v13 to v22 takes nine hops in our planner', () => {
    const hops = planHops(13, 22);
    expect(hops).toHaveLength(9);
    expect(hops.map((hop) => hop.to)).toEqual([14, 15, 16, 17, 18, 19, 20, 21, 22]);
    expect(hops.every((hop) => hop.to - hop.from === 1)).toBe(true);

    // A Node that fits the 13.0.x row (16.14.0) is refused first by the 17.0.x row; our check, on the fixture's text.
    expect(fits('16.14.0', compatTable[0]?.node ?? '')).toBe(true);
    expect(hops.find((hop) => !fits('16.14.0', hop.row.node))?.to).toBe(17);

    // The first row that refuses the newest release of an older Node major after an earlier row accepted it (our check).
    const droppedAt = (nodeMajor: number): number | undefined => {
      const accepted = compatTable.map((row) => fits(`${nodeMajor}.99.99`, row.node));
      const firstAccepted = accepted.indexOf(true);
      const refusedAfter = accepted.findIndex((ok, i) => i > firstAccepted && !ok);
      return compatTable[refusedAfter]?.major;
    };
    expect([12, 14, 16, 18, 20].map(droppedAt)).toEqual([14, 16, 17, 20, 22]);

    // The TypeScript lower bound (the first version in the row's range) rises on every hop from the 13.0.x row.
    const lowerBound = (row: CompatRow): Version => parseVersion(row.typescript.replace(/^(>=|~)/, '').split(' ')[0] ?? '');
    const bounds = compatTable.map(lowerBound);
    expect(bounds.every((bound, i) => i === 0 || compare(bounds[i - 1] ?? [0, 0, 0], bound) < 0)).toBe(true);
    expect(bounds.map((bound) => bound.join('.'))).toEqual([
      '4.4.3', '4.6.2', '4.8.2', '4.9.3', '5.2.0', '5.4.0', '5.5.0', '5.8.0', '5.9.0', '6.0.0',
    ]);
  });

  it('Section 8: the Node baseline of the 22.0 row excludes Node 20', () => {
    const row21 = compatTable.find((row) => row.major === 21);
    const row22 = compatTable.find((row) => row.major === 22);
    expect(row21?.node).toBe('^20.19.0 || ^22.12.0 || ^24.0.0');
    expect(row22?.node).toBe('^22.22.3 || ^24.15.0 || ^26.0.0');

    // Our check, not npm's: Node 20.19.0 and 20.99.0 are outside the 22.0.x row, 22.12.0 too, while 22.22.3 and 26.0.0 are inside.
    expect(fits('20.19.0', row21?.node ?? '')).toBe(true);
    expect(fits('20.19.0', row22?.node ?? '')).toBe(false);
    expect(fits('20.99.0', row22?.node ?? '')).toBe(false);
    expect(fits('22.12.0', row22?.node ?? '')).toBe(false);
    expect(fits('22.22.3', row22?.node ?? '')).toBe(true);
    expect(fits('26.0.0', row22?.node ?? '')).toBe(true);
  });
});
