// labs/angular/src/app/modules/17-signals/concepts/responsive-grid.ts
import { afterRenderEffect, Component, ElementRef, inject, input } from '@angular/core';

export const MIN_COLUMN_PX = 160;

/** How many columns fit, never fewer than 1 and never more than there are items. */
export function columnsFor(widthPx: number, itemCount: number): number {
  const fit = Math.floor(widthPx / MIN_COLUMN_PX);
  return Math.max(1, Math.min(itemCount, fit));
}

@Component({
  selector: 'lab-responsive-grid',
  template: `
    @for (item of items(); track item) {
      <div class="cell">{{ item }}</div>
    }
  `,
})
export class ResponsiveGrid {
  readonly items = input<readonly string[]>([]);
  readonly #host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    afterRenderEffect({
      // Read layout first, in its own phase, so reads and writes are not interleaved.
      earlyRead: () => this.#host.nativeElement.clientWidth,
      // The previous phase's result arrives as a signal.
      write: (width) => {
        const columns = columnsFor(width(), this.items().length);
        this.#host.nativeElement.style.setProperty('--columns', String(columns));
      },
    });
  }
}
