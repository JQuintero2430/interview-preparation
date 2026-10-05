export interface Debounced<A extends unknown[]> {
  (...args: A): void;
  /** Drop the pending call, if any. */
  cancel(): void;
  /** Run the pending call now, if any. */
  flush(): void;
}

/**
 * Trailing-edge debounce: `fn` runs once, `waitMs` after the LAST call,
 * with the LAST call's arguments.
 */
export function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  waitMs: number,
): Debounced<A> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pendingArgs: A | undefined;

  function run(): void {
    timer = undefined;
    const args = pendingArgs;
    pendingArgs = undefined;
    if (args) fn(...args);
  }

  const debounced = (...args: A): void => {
    pendingArgs = args;
    if (timer !== undefined) clearTimeout(timer);
    timer = setTimeout(run, waitMs);
  };

  debounced.cancel = (): void => {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
    pendingArgs = undefined;
  };

  debounced.flush = (): void => {
    if (timer === undefined) return;
    clearTimeout(timer);
    run();
  };

  return debounced;
}
