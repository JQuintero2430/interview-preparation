/** Marker searched for in the built files: nothing uses this export and the module has no top-level statement. */
const MARKER_UNUSED_PURE = 'M31_MARKER_UNUSED_PURE';

/**
 * A pure function that no file calls.
 * @returns A string carrying the marker.
 */
export function unusedPureHelper(): string {
  return MARKER_UNUSED_PURE;
}
