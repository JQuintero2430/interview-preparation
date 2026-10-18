/** Marker searched for in the built files: this export is used by the page, so it must survive. */
const MARKER_USED = 'M31_MARKER_USED';

/**
 * The one export the tree-shaking page uses.
 * @returns The text the page renders; it carries the marker the build output is searched for.
 */
export function usedGreeting(): string {
  return MARKER_USED;
}
