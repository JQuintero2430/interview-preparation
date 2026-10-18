import { Component, DestroyRef, Injectable, inject, signal } from '@angular/core';

/** Window event both panels listen to; any event works, the retainer is the listener itself. */
const RESIZE = 'resize';

/** Name of the lab instrumentation object on `window`; tests count instances through it. */
const HOOK_NAME = '__m31Leaks';

/**
 * Root-provided cache that keeps the last removed chart canvas "for reuse".
 * Because it lives as long as the app, the canvas it holds stays in memory after
 * Angular removes it from the document: a detached node.
 */
@Injectable({ providedIn: 'root' })
export class LabM31ChartCache {
  private kept: HTMLCanvasElement | null = null;

  /** Keeps a reference to the canvas, which retains it after it leaves the document. */
  keep(canvas: HTMLCanvasElement): void {
    this.kept = canvas;
  }

  /** Drops the reference, so the canvas becomes unreachable. */
  release(): void {
    this.kept = null;
  }
}

/** Leaky on purpose: the `window` listener closes over `this` and is never removed. */
@Component({
  selector: 'lab-m31-leaky-panel',
  template: `
    <section aria-label="Leaky panel">
      <p>Window resized {{ resizes() }} times.</p>
    </section>
  `,
})
export class LabM31LeakyPanel {
  protected readonly resizes = signal(0);

  constructor() {
    window.addEventListener(RESIZE, () => this.resizes.update((count) => count + 1));
  }
}

/** Fixed: the same listener, removed when Angular destroys the view. */
@Component({
  selector: 'lab-m31-fixed-panel',
  template: `
    <section aria-label="Fixed panel">
      <p>Window resized {{ resizes() }} times.</p>
    </section>
  `,
})
export class LabM31FixedPanel {
  protected readonly resizes = signal(0);

  constructor() {
    const onResize = (): void => this.resizes.update((count) => count + 1);
    window.addEventListener(RESIZE, onResize);
    inject(DestroyRef).onDestroy(() => window.removeEventListener(RESIZE, onResize));
  }
}

/**
 * Memory-leak lab page: a leaky and a fixed panel to open and close, and a chart
 * canvas that a root service keeps after it is removed from the page.
 */
@Component({
  selector: 'lab-m31-leaks',
  imports: [LabM31LeakyPanel, LabM31FixedPanel],
  template: `
    <h1>Memory leaks lab</h1>
    <button type="button" [attr.aria-pressed]="leakyOpen()" (click)="toggleLeaky()">Toggle leaky panel</button>
    <button type="button" [attr.aria-pressed]="fixedOpen()" (click)="toggleFixed()">Toggle fixed panel</button>
    @if (leakyOpen()) {
      <lab-m31-leaky-panel />
    }
    @if (fixedOpen()) {
      <lab-m31-fixed-panel />
    }
    <h2>Detached element</h2>
    @if (chartShown()) {
      <canvas #chart width="200" height="100" role="img" aria-label="Sales chart"></canvas>
      <button type="button" (click)="removeChart(chart)">Remove chart</button>
    } @else {
      <p>Chart removed from the page.</p>
    }
    <button type="button" (click)="releaseChart()">Release chart</button>
  `,
})
export class LabM31Leaks {
  protected readonly leakyOpen = signal(false);
  protected readonly fixedOpen = signal(false);
  protected readonly chartShown = signal(true);
  private readonly chartCache = inject(LabM31ChartCache);

  constructor() {
    // Lab instrumentation, not application code: the production build minifies class
    // names, so a test cannot find a component prototype by name. Exposing the two
    // prototypes lets `Runtime.queryObjects` count live panels; prototypes hold no instance.
    Reflect.set(window, HOOK_NAME, {
      leakyPanel: LabM31LeakyPanel.prototype,
      fixedPanel: LabM31FixedPanel.prototype,
    });
    inject(DestroyRef).onDestroy(() => Reflect.deleteProperty(window, HOOK_NAME));
  }

  /** Opens or closes the leaky panel. */
  protected toggleLeaky(): void {
    this.leakyOpen.update((open) => !open);
  }

  /** Opens or closes the fixed panel. */
  protected toggleFixed(): void {
    this.fixedOpen.update((open) => !open);
  }

  /** Hands the canvas to the cache, then lets Angular remove it from the page. */
  protected removeChart(canvas: HTMLCanvasElement): void {
    this.chartCache.keep(canvas);
    this.chartShown.set(false);
  }

  /** Cuts the cache's reference to the removed canvas. */
  protected releaseChart(): void {
    this.chartCache.release();
  }
}
