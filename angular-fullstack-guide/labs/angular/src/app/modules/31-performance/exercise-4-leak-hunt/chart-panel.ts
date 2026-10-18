import { Component, DestroyRef, ElementRef, inject, signal, type WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, fromEvent, interval } from 'rxjs';
import { PanelRegistry } from './panel-registry';

/** Window event every panel listens to; the retainer is the listener itself. */
const RESIZE = 'resize';

/** Interval period of the panel's "chart refresh". */
const TICK_MS = 100;

/** Markup shared by the three variants, so only their cleanup differs. */
const PANEL_TEMPLATE = `
  <section aria-label="Chart panel">
    <p>Ticks: {{ ticks() }}</p>
    <p>Resizes: {{ resizes() }}</p>
  </section>
`;

/** Lab counters for the panels' timers (lab instrumentation, exposed on `window` by the page). */
export interface LabTimerStats {
  /** Timers started and not yet stopped. */
  live: number;
  /** Ticks counted by every panel's timer. */
  ticks: number;
  /** Ticks counted by a panel whose host element is no longer in the document. */
  orphanTicks: number;
}

/** Live view of the timer counters; tests poll it instead of sleeping. */
export const labTimerStats: LabTimerStats = { live: 0, ticks: 0, orphanTicks: 0 };

let lastPanelId = 0;

/** Counts one tick in the panel and in the lab counters, flagging ticks of a removed panel. */
function countTick(ticks: WritableSignal<number>, host: HTMLElement): void {
  ticks.update((count) => count + 1);
  labTimerStats.ticks += 1;
  if (!host.isConnected) labTimerStats.orphanTicks += 1;
}

/** Starts the panel's interval and returns its handle, which `stopLabTimer` needs. */
function startLabTimer(ticks: WritableSignal<number>, host: HTMLElement): ReturnType<typeof setInterval> {
  labTimerStats.live += 1;
  return setInterval(() => countTick(ticks, host), TICK_MS);
}

/** Stops an interval started by `startLabTimer`. */
function stopLabTimer(handle: ReturnType<typeof setInterval>): void {
  clearInterval(handle);
  labTimerStats.live -= 1;
}

/** Leaky on purpose: the registry, the `window` listener and the interval all keep the panel. */
@Component({ selector: 'lab-m31-leaky-chart-panel', template: PANEL_TEMPLATE })
export class LabM31LeakyChartPanel {
  protected readonly ticks = signal(0);
  protected readonly resizes = signal(0);

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    inject(PanelRegistry).add(this);
    window.addEventListener(RESIZE, () => this.resizes.update((count) => count + 1));
    startLabTimer(this.ticks, host);
  }
}

/** Solution: one `DestroyRef` callback undoes the three registrations. */
@Component({ selector: 'lab-m31-destroyref-chart-panel', template: PANEL_TEMPLATE })
export class LabM31DestroyRefChartPanel {
  protected readonly ticks = signal(0);
  protected readonly resizes = signal(0);

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const registry = inject(PanelRegistry);
    const onResize = (): void => this.resizes.update((count) => count + 1);
    registry.add(this);
    window.addEventListener(RESIZE, onResize);
    const timer = startLabTimer(this.ticks, host);
    inject(DestroyRef).onDestroy(() => {
      registry.remove(this);
      window.removeEventListener(RESIZE, onResize);
      stopLabTimer(timer);
    });
  }
}

/** Alternative: RxJS streams ended by `takeUntilDestroyed`, and a registry entry that is only an id. */
@Component({ selector: 'lab-m31-signals-chart-panel', template: PANEL_TEMPLATE })
export class LabM31SignalsChartPanel {
  protected readonly ticks = signal(0);
  protected readonly resizes = signal(0);

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const registry = inject(PanelRegistry);
    const id = ++lastPanelId;
    registry.addId(id);
    inject(DestroyRef).onDestroy(() => registry.removeId(id));
    fromEvent(window, RESIZE)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.resizes.update((count) => count + 1));
    labTimerStats.live += 1;
    interval(TICK_MS)
      .pipe(
        finalize(() => {
          labTimerStats.live -= 1;
        }),
        takeUntilDestroyed(),
      )
      .subscribe(() => countTick(this.ticks, host));
  }
}
