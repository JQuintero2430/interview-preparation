import { Component, computed, ElementRef, signal, viewChild } from '@angular/core';
import {
  LAB_M31_LINE_COUNT,
  LAB_M31_LINE_HEIGHT_PX,
  makeLogLines,
  windowForScroll,
} from './log-lines';

/**
 * Log viewer, alternative variant: a signal-driven window. A `scroll` event writes `scrollTop`,
 * the start index is `floor(scrollTop / 24)`, and a 240,000 px spacer keeps the scrollbar honest.
 */
@Component({
  selector: 'lab-m31-log-viewer-window',
  styles: `
    .viewport {
      height: 480px;
      overflow: auto;
      outline: 1px solid #888;
    }
    .spacer {
      position: relative;
    }
    .window {
      position: absolute;
      left: 0;
      right: 0;
    }
    .line {
      box-sizing: border-box;
      height: 24px;
      line-height: 24px;
      padding: 0 8px;
      font-family: monospace;
    }
  `,
  template: `
    <div
      #scroller
      class="viewport"
      role="region"
      aria-label="Log lines"
      tabindex="0"
      (scroll)="scrollTop.set(scroller.scrollTop)"
    >
      <div class="spacer" [style.height.px]="totalHeight">
        <div class="window" [style.top.px]="offset()">
          @for (line of rendered(); track line.id) {
            <div class="line">{{ line.text }}</div>
          }
        </div>
      </div>
    </div>
  `,
})
export class LabM31LogViewerWindow {
  protected readonly totalHeight = LAB_M31_LINE_COUNT * LAB_M31_LINE_HEIGHT_PX;
  protected readonly scrollTop = signal(0);
  private readonly lines = makeLogLines(LAB_M31_LINE_COUNT);
  private readonly scroller = viewChild.required<ElementRef<HTMLElement>>('scroller');

  private readonly range = computed(() => windowForScroll(this.scrollTop(), LAB_M31_LINE_COUNT));
  protected readonly rendered = computed(() => this.lines.slice(this.range().start, this.range().end));
  protected readonly offset = computed(() => this.range().start * LAB_M31_LINE_HEIGHT_PX);

  /**
   * Scrolls so the given line is the first visible row.
   * @param line - 1-based line number, already validated by the caller.
   */
  jumpTo(line: number): void {
    const element = this.scroller().nativeElement;
    element.scrollTop = (line - 1) * LAB_M31_LINE_HEIGHT_PX;
    // Written back directly: the scroll event arrives later, and the window should not wait for it.
    this.scrollTop.set(element.scrollTop);
  }
}
