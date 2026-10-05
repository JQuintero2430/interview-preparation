export interface Throttled<A extends unknown[]> {
  (...args: A): void;
  cancel(): void;
}

/**
 * Leading + trailing throttle: the first call in a window runs immediately;
 * further calls in the window are collapsed into ONE trailing call (with the
 * latest arguments) when the window ends. `fn` runs at most once per `waitMs`.
 */
export function throttle<A extends unknown[]>(
  fn: (...args: A) => void,
  waitMs: number,
): Throttled<A> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let trailingArgs: A | undefined;

  function onWindowEnd(): void {
    timer = undefined;
    const args = trailingArgs;
    trailingArgs = undefined;
    if (args) {
      fn(...args);
      timer = setTimeout(onWindowEnd, waitMs); // the trailing call opens a new window
    }
  }

  const throttled = (...args: A): void => {
    if (timer === undefined) {
      fn(...args);
      timer = setTimeout(onWindowEnd, waitMs);
    } else {
      trailingArgs = args;
    }
  };

  throttled.cancel = (): void => {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
    trailingArgs = undefined;
  };

  return throttled;
}
