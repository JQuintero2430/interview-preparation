import { ScrollingModule, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { afterNextRender, Component, DestroyRef, inject, viewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

/** One row of the lab list. */
interface LabM31Row {
  readonly id: number;
  readonly label: string;
}

/** Number of rows in the list, and the fixed height of each row in pixels (the CSS below uses the same 40). */
const ROW_COUNT = 10_000;
const ROW_HEIGHT_PX = 40;

/** Query value that selects the plain `@for` variant. */
const PLAIN_MODE = 'for';

/** Name of the lab instrumentation hook on `window`; tests read the rendered range through it. */
const HOOK_NAME = '__m31LongList';

/** Builds the rows once; ids are stable so `track` has something to track by. */
function makeRows(count: number): readonly LabM31Row[] {
  return Array.from({ length: count }, (_, id) => ({ id, label: `Row ${id}` }));
}

/**
 * Long-list lab page: 10,000 rows of 40 px in a 400 px viewport, either through the CDK's
 * virtual scrolling (default) or as a plain `@for` (`?mode=for`).
 */
@Component({
  selector: 'lab-m31-long-list',
  imports: [ScrollingModule],
  styles: `
    .viewport {
      height: 400px;
      overflow: auto;
      border: 1px solid #888;
    }
    .row {
      box-sizing: border-box;
      height: 40px;
      line-height: 40px;
      padding: 0 8px;
      border-bottom: 1px solid #ddd;
    }
  `,
  template: `
    <h1>Long list lab</h1>
    @if (plain) {
      <p>Plain list: every row is in the DOM.</p>
      <div class="viewport" role="list" aria-label="All 10,000 rows">
        @for (item of items; track item.id) {
          <div class="row" role="listitem">{{ item.label }}</div>
        }
      </div>
    } @else {
      <p>Virtual list: only the rendered range is in the DOM.</p>
      <cdk-virtual-scroll-viewport class="viewport" [itemSize]="rowHeight">
        <div *cdkVirtualFor="let item of items; trackBy: trackById" class="row">{{ item.label }}</div>
      </cdk-virtual-scroll-viewport>
    }
  `,
})
export class LabM31LongList {
  protected readonly items = makeRows(ROW_COUNT);
  protected readonly rowHeight = ROW_HEIGHT_PX;
  protected readonly plain = inject(ActivatedRoute).snapshot.queryParamMap.get('mode') === PLAIN_MODE;
  private readonly viewport = viewChild(CdkVirtualScrollViewport);

  constructor() {
    // Lab instrumentation, not application code: a test cannot reach the viewport instance
    // through the DOM, so the page exposes the two calls the module's tests need.
    afterNextRender(() => {
      const viewport = this.viewport();
      if (!viewport) return;
      Reflect.set(window, HOOK_NAME, {
        getRenderedRange: () => viewport.getRenderedRange(),
        scrollToIndex: (index: number) => viewport.scrollToIndex(index),
      });
    });
    inject(DestroyRef).onDestroy(() => Reflect.deleteProperty(window, HOOK_NAME));
  }

  /** Track function for `*cdkVirtualFor`: the row's id, so a recycled view is bound to the right item. */
  protected trackById(_index: number, item: LabM31Row): number {
    return item.id;
  }
}
