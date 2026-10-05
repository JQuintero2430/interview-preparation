/** A closure keeps the VARIABLE alive (not a copy of its value): both functions share `count`. */
export function makeCounter() {
  let count = 0;
  return {
    increment: () => ++count,
    read: () => count,
  };
}

/**
 * A miniature of React's "state is a snapshot": every render() call captures the
 * state value of THAT render in a fresh closure. A handler created by an old render
 * keeps reading the old value; `live` reads the variable that is still moving.
 */
export function createSnapshotDemo() {
  let state = 0;
  return {
    setState(next: number): void {
      state = next;
    },
    render() {
      const captured = state; // the render's own constant, like `count` in a component
      return {
        handler: (): number => captured, // stale after setState
        live: (): number => state, // reads the shared variable (what a ref gives you)
      };
    },
  };
}

/** The 2010 module pattern: an IIFE gives a private scope; only the returned object escapes. */
export const idGenerator = (() => {
  let next = 1; // private: no way to reach this from outside
  return {
    nextId: (): number => next++,
  };
})();

/** Run `fn` at most once and return the first result forever. */
export function once<A extends unknown[], R>(fn: (...args: A) => R): (...args: A) => R {
  let called = false;
  let result: R | undefined;
  return (...args: A): R => {
    if (!called) {
      result = fn(...args);
      called = true;
    }
    return result as R;
  };
}
