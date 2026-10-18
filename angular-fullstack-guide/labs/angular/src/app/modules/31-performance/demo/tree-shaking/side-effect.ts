/** Marker searched for in the built files: it sits in a top-level statement, which runs when the module loads. */
const MARKER_SIDE_EFFECT = 'M31_MARKER_SIDE_EFFECT';

// Lab instrumentation: a write to the global object is a side effect, so the bundler cannot drop this statement.
Reflect.set(globalThis, '__m31SideEffect', MARKER_SIDE_EFFECT);

/**
 * An export that no file uses, in a module whose top-level statement above must still run.
 * @returns A fixed string.
 */
export function unusedSideEffectExport(): string {
  return 'side-effect module';
}
