/** The only two things the algorithm does to the DOM; injectable so a test can record their ORDER. */
export interface WidthOps {
  /** A layout READ: forces the browser to flush pending style/layout work if the DOM is dirty. */
  readWidth(el: HTMLElement): number;
  /** A layout WRITE: dirties style/layout. */
  writeWidth(el: HTMLElement, px: number): void;
}

export const domOps: WidthOps = {
  readWidth: (el) => el.offsetWidth,
  writeWidth: (el, px) => {
    el.style.width = `${px}px`;
  },
};

/** Set every element to half of its parent's width. BAD: read, write, read, write... (forced reflow per item) */
export function halveWidthsThrashing(els: readonly HTMLElement[], ops: WidthOps = domOps): void {
  for (const el of els) {
    if (!el.parentElement) continue;
    ops.writeWidth(el, ops.readWidth(el.parentElement) / 2);
  }
}

/** Same result: all reads first, then all writes. One layout instead of N. */
export function halveWidthsBatched(els: readonly HTMLElement[], ops: WidthOps = domOps): void {
  const widths = els.map((el) => (el.parentElement ? ops.readWidth(el.parentElement) : null));
  els.forEach((el, i) => {
    const width = widths[i];
    if (width == null) return;
    ops.writeWidth(el, width / 2);
  });
}

/**
 * A tiny fastdom-style scheduler for code that cannot be restructured in one place: any number of
 * `measure` and `mutate` calls made before the next frame run as ALL measures, then ALL mutations.
 */
export function createFrameBatcher(
  schedule: (flush: () => void) => void = (flush) => {
    requestAnimationFrame(() => flush());
  },
) {
  const reads: Array<() => void> = [];
  const writes: Array<() => void> = [];
  let scheduled = false;

  const flush = () => {
    scheduled = false;
    const r = reads.splice(0);
    const w = writes.splice(0);
    r.forEach((fn) => fn());
    w.forEach((fn) => fn());
  };
  const ensureScheduled = () => {
    if (scheduled) return;
    scheduled = true;
    schedule(flush);
  };

  return {
    measure(fn: () => void) {
      reads.push(fn);
      ensureScheduled();
    },
    mutate(fn: () => void) {
      writes.push(fn);
      ensureScheduled();
    },
  };
}
