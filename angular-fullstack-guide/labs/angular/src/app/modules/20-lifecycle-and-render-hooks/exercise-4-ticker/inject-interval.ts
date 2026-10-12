import { Signal, effect, signal } from '@angular/core';

/**
 * A tick counter that runs while `active()` is true. The effect starts one interval when the
 * flag turns on and clears it when the flag turns off or the owner is destroyed.
 * Call it in an injection context, such as a field initializer.
 */
export function injectInterval(ms: number, active: Signal<boolean>): Signal<number> {
  const ticks = signal(0);
  effect((onCleanup) => {
    if (!active()) {
      return;
    }
    const id = setInterval(() => ticks.update((count) => count + 1), ms);
    onCleanup(() => clearInterval(id));
  });
  return ticks.asReadonly();
}
