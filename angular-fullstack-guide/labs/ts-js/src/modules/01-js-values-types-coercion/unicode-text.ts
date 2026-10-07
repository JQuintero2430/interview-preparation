// labs/ts-js/src/modules/01-js-values-types-coercion/unicode-text.ts
// Exercise 01.1: text helpers that count and cut what users see, not UTF-16 code units.

const DEFAULT_ELLIPSIS = '…';

// One shared segmenter: building an Intl object is far more expensive than reusing it.
// No locale is passed because grapheme boundaries come from Unicode's default rules (UAX #29).
const GRAPHEME_SEGMENTER = new Intl.Segmenter(undefined, { granularity: 'grapheme' });

/**
 * Counts Unicode code points. String iteration walks code points, so a surrogate pair counts once.
 * @param text any string
 * @returns the number of code points (an emoji such as 😀 counts as 1, its `length` is 2)
 */
export function codePointLength(text: string): number {
  return [...text].length;
}

/**
 * Splits a string into extended grapheme clusters: what a reader perceives as one character.
 * @param text any string
 * @returns the clusters in order; joining them gives back `text`
 */
export function graphemes(text: string): string[] {
  return Array.from(GRAPHEME_SEGMENTER.segment(text), (part) => part.segment);
}

/**
 * Counts grapheme clusters, for example to enforce a "max 280 characters" rule the way users count.
 * @param text any string
 * @returns the number of grapheme clusters (👍🏽 and e + U+0301 each count as 1)
 */
export function graphemeCount(text: string): number {
  return graphemes(text).length;
}

/**
 * Shortens text to at most `maxGraphemes` visible characters, ellipsis included, without ever
 * splitting a surrogate pair or a grapheme cluster.
 * @param text the text to shorten
 * @param maxGraphemes a positive integer: the maximum number of clusters in the result
 * @param ellipsis appended when the text is cut; dropped if it alone would not fit
 * @returns `text` unchanged when it fits, otherwise a prefix of whole clusters plus the ellipsis
 * @throws RangeError when `maxGraphemes` is not a positive integer
 */
export function truncate(text: string, maxGraphemes: number, ellipsis: string = DEFAULT_ELLIPSIS): string {
  if (!Number.isInteger(maxGraphemes) || maxGraphemes < 1) {
    throw new RangeError(`maxGraphemes must be a positive integer, got ${maxGraphemes}`);
  }
  const clusters = graphemes(text);
  if (clusters.length <= maxGraphemes) return text;

  const ellipsisLength = graphemeCount(ellipsis);
  if (ellipsisLength >= maxGraphemes) return clusters.slice(0, maxGraphemes).join('');
  return clusters.slice(0, maxGraphemes - ellipsisLength).join('') + ellipsis;
}
