/** Marker searched for in the built files: it sits in a static block, which runs when the class is defined. */
const MARKER_STATIC_BLOCK = 'M31_MARKER_STATIC_BLOCK';

/** A class that nothing uses, whose static block writes to the global object (lab instrumentation). */
export class LabM31StaticBlockHolder {
  static {
    Reflect.set(globalThis, '__m31StaticBlock', MARKER_STATIC_BLOCK);
  }
}
