import { codePointLength, graphemeCount, truncate } from './unicode-text';

const THUMB_MEDIUM = '👍🏽'; // U+1F44D + U+1F3FD: 2 code points, 4 code units, 1 grapheme
const E_ACUTE_DECOMPOSED = 'e\u0301'; // e + COMBINING ACUTE ACCENT: 2 code points, 1 grapheme

describe('E01.1 Unicode-safe text helpers', () => {
  it('codePointLength counts code points, not code units', () => {
    expect(codePointLength('😀')).toBe(1);
    expect('😀'.length).toBe(2);
    expect(codePointLength('ab')).toBe(2);
    expect(codePointLength(THUMB_MEDIUM)).toBe(2);
  });

  it('graphemeCount counts what a reader sees', () => {
    expect(graphemeCount(THUMB_MEDIUM)).toBe(1);
    expect(graphemeCount(E_ACUTE_DECOMPOSED)).toBe(1);
    expect(graphemeCount('café😀')).toBe(5);
  });

  it('truncate returns the input unchanged when it fits', () => {
    expect(truncate('hello', 5)).toBe('hello');
    expect(truncate(`ok${THUMB_MEDIUM}`, 3)).toBe(`ok${THUMB_MEDIUM}`);
  });

  it('truncate keeps the result within maxGraphemes, ellipsis included', () => {
    expect(truncate('hello world', 6)).toBe('hello…');
    expect(graphemeCount(truncate('hello world', 6))).toBe(6);
    expect(truncate('hello world', 6, '...')).toBe('hel...');
    expect(truncate('hello', 2, '...')).toBe('he');
  });

  it('truncate never splits a surrogate pair or a grapheme cluster', () => {
    const text = `a${THUMB_MEDIUM}b${E_ACUTE_DECOMPOSED}cd`;
    for (let max = 1; max <= graphemeCount(text); max++) {
      expect(truncate(text, max).isWellFormed()).toBe(true);
    }
    expect(truncate(text, 3)).toBe(`a${THUMB_MEDIUM}…`);
    expect(truncate(text, 5)).toBe(`a${THUMB_MEDIUM}b${E_ACUTE_DECOMPOSED}…`);
    // The naive version this exercise replaces produces a lone surrogate:
    expect(`a${THUMB_MEDIUM}`.slice(0, 2).isWellFormed()).toBe(false);
  });

  it('truncate rejects a maxGraphemes that is not a positive integer', () => {
    expect(() => truncate('abc', 0)).toThrow(RangeError);
    expect(() => truncate('abc', 1.5)).toThrow(RangeError);
    expect(() => truncate('abc', Number.NaN)).toThrow(RangeError);
  });
});
