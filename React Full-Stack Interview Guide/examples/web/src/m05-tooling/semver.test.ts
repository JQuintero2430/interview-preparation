import { describe, expect, it } from 'vitest';
import { compareVersions, maxSatisfying, parseRange, parseVersion, satisfies } from './semver';

describe('caret', () => {
  it('allows changes that do not touch the left-most non-zero digit', () => {
    expect(satisfies('1.4.2', '^1.2.0')).toBe(true);
    expect(satisfies('1.2.0', '^1.2.0')).toBe(true);
    expect(satisfies('1.1.9', '^1.2.0')).toBe(false);
    expect(satisfies('2.0.0', '^1.2.0')).toBe(false);
  });

  it('is stricter below 1.0.0', () => {
    expect(satisfies('0.2.9', '^0.2.3')).toBe(true);
    expect(satisfies('0.3.0', '^0.2.3')).toBe(false);
    expect(satisfies('0.0.3', '^0.0.3')).toBe(true);
    expect(satisfies('0.0.4', '^0.0.3')).toBe(false);
    expect(satisfies('0.9.9', '^0')).toBe(true);
    expect(satisfies('1.0.0', '^0')).toBe(false);
  });
});

describe('tilde, x-ranges, comparators', () => {
  it('~ allows patch changes (or minor when the minor is omitted)', () => {
    expect(satisfies('1.2.9', '~1.2.3')).toBe(true);
    expect(satisfies('1.3.0', '~1.2.3')).toBe(false);
    expect(satisfies('1.2.0', '~1.2')).toBe(true);
    expect(satisfies('1.9.0', '~1')).toBe(true);
    expect(satisfies('2.0.0', '~1')).toBe(false);
  });

  it('x-ranges and wildcards', () => {
    expect(satisfies('1.9.9', '1.x')).toBe(true);
    expect(satisfies('2.0.0', '1.x')).toBe(false);
    expect(satisfies('1.2.7', '1.2.x')).toBe(true);
    expect(satisfies('1.3.0', '1.2.x')).toBe(false);
    expect(satisfies('7.7.7', '*')).toBe(true);
    expect(satisfies('7.7.7', '')).toBe(true);
  });

  it('comparators combine with spaces (AND)', () => {
    expect(satisfies('1.5.0', '>=1.2.0 <2.0.0')).toBe(true);
    expect(satisfies('2.0.0', '>=1.2.0 <2.0.0')).toBe(false);
    expect(satisfies('1.5.0', '>= 1.2.0 < 2.0.0')).toBe(true);
  });

  it('partial comparators round the way npm does', () => {
    expect(satisfies('1.2.9', '>1.2')).toBe(false);
    expect(satisfies('1.3.0', '>1.2')).toBe(true);
    expect(satisfies('1.9.9', '<=1')).toBe(true);
    expect(satisfies('2.0.0', '<=1')).toBe(false);
  });

  it('exact versions, with or without = and v', () => {
    expect(satisfies('1.2.3', '1.2.3')).toBe(true);
    expect(satisfies('1.2.4', '=1.2.3')).toBe(false);
    expect(satisfies('v1.2.3', '1.2.3')).toBe(true);
  });

  it('|| joins alternatives, like a React peer range', () => {
    expect(satisfies('18.3.1', '^18.0.0 || ^19.0.0')).toBe(true);
    expect(satisfies('19.3.0', '^18.0.0 || ^19.0.0')).toBe(true);
    expect(satisfies('17.0.2', '^18.0.0 || ^19.0.0')).toBe(false);
  });
});

describe('prereleases', () => {
  it('are excluded unless the range names a prerelease of the same version', () => {
    expect(satisfies('1.3.0-beta.1', '^1.2.0')).toBe(false);
    expect(satisfies('1.3.0-beta.1', '>=1.3.0-alpha.1')).toBe(true);
    expect(satisfies('1.2.3-beta.2', '^1.2.3-beta.1')).toBe(true);
    expect(satisfies('1.2.4-beta.1', '^1.2.3-beta.1')).toBe(false);
  });

  it('orders them per the semver spec', () => {
    const ordered = ['1.0.0-alpha', '1.0.0-alpha.1', '1.0.0-alpha.beta', '1.0.0-beta', '1.0.0-beta.2', '1.0.0-beta.11', '1.0.0-rc.1', '1.0.0'];
    const parsed = ordered.map((s) => parseVersion(s)!);
    const shuffled = [...parsed].reverse().sort(compareVersions);
    expect(shuffled).toEqual(parsed);
  });
});

describe('invalid input', () => {
  it('never satisfies', () => {
    expect(satisfies('nope', '^1.0.0')).toBe(false);
    expect(satisfies('1.0.0', '^banana')).toBe(false);
    expect(() => parseRange('^banana')).toThrow(RangeError);
  });
});

describe('maxSatisfying', () => {
  it('compares numerically, not lexicographically', () => {
    expect(maxSatisfying(['1.2.0', '1.9.3', '2.0.0', '1.10.0'], '^1.2.0')).toBe('1.10.0');
    expect(maxSatisfying(['0.9.0'], '^1.0.0')).toBeNull();
  });
});
