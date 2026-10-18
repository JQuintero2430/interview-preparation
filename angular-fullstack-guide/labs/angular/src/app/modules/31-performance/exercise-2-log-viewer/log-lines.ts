/** One line of the log. */
export interface LabM31LogLine {
  readonly id: number;
  readonly text: string;
}

/** The slice of lines a window renders: `start` inclusive, `end` exclusive. */
export interface LabM31LineWindow {
  readonly start: number;
  readonly end: number;
}

/** Geometry shared by both variants: 10,000 fixed-height rows in a 480 px viewport. */
export const LAB_M31_LINE_COUNT = 10_000;
export const LAB_M31_LINE_HEIGHT_PX = 24;
export const LAB_M31_VIEWPORT_HEIGHT_PX = 480;

/** Rows kept above and below the visible ones, so a fast scroll never shows a blank edge. */
const OVERSCAN_ROWS = 5;

const NUMBER_FORMAT = new Intl.NumberFormat('en-US');

/**
 * Builds the log once; ids are stable so `track` has something to track by.
 * @param count - Number of lines to create.
 * @returns Lines whose text is `Line 1` to `Line 10,000` (thousands separator, 1-based).
 */
export function makeLogLines(count: number): readonly LabM31LogLine[] {
  return Array.from({ length: count }, (_, id) => ({ id, text: `Line ${NUMBER_FORMAT.format(id + 1)}` }));
}

/**
 * Maps a scroll offset to the slice of lines the hand-written window renders.
 * @param scrollTop - The scroll container's `scrollTop` in pixels.
 * @param count - Total number of lines.
 * @returns First line index (with overscan), and the exclusive end index, both clamped to the list.
 */
export function windowForScroll(scrollTop: number, count: number): LabM31LineWindow {
  const first = Math.floor(scrollTop / LAB_M31_LINE_HEIGHT_PX);
  // One extra row because the first visible row is usually only partly scrolled in.
  const visible = Math.ceil(LAB_M31_VIEWPORT_HEIGHT_PX / LAB_M31_LINE_HEIGHT_PX) + 1;
  return {
    start: Math.max(0, first - OVERSCAN_ROWS),
    end: Math.min(count, first + visible + OVERSCAN_ROWS),
  };
}

/**
 * Validates the text of the "jump to line" input.
 * @param text - Raw input value.
 * @returns The 1-based line number, or null when it is not an integer from 1 to the line count.
 */
export function parseLineNumber(text: string): number | null {
  const line = Number(text.trim());
  const valid = Number.isInteger(line) && line >= 1 && line <= LAB_M31_LINE_COUNT;
  return valid ? line : null;
}
