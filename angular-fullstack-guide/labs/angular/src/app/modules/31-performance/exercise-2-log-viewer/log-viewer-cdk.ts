import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { Component, viewChild } from '@angular/core';
import {
  LAB_M31_LINE_COUNT,
  LAB_M31_LINE_HEIGHT_PX,
  type LabM31LogLine,
  makeLogLines,
} from './log-lines';

/** Log viewer, solution variant: the CDK's fixed-size virtual scrolling with `itemSize` 24. */
@Component({
  selector: 'lab-m31-log-viewer-cdk',
  imports: [ScrollingModule],
  styles: `
    .viewport {
      height: 480px;
      outline: 1px solid #888;
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
    <cdk-virtual-scroll-viewport
      class="viewport"
      role="region"
      aria-label="Log lines"
      tabindex="0"
      [itemSize]="lineHeight"
    >
      <div *cdkVirtualFor="let line of lines; trackBy: trackById" class="line">{{ line.text }}</div>
    </cdk-virtual-scroll-viewport>
  `,
})
export class LabM31LogViewerCdk {
  protected readonly lines = makeLogLines(LAB_M31_LINE_COUNT);
  protected readonly lineHeight = LAB_M31_LINE_HEIGHT_PX;
  private readonly viewport = viewChild.required(CdkVirtualScrollViewport);

  /**
   * Scrolls so the given line is the first visible row.
   * @param line - 1-based line number, already validated by the caller.
   */
  jumpTo(line: number): void {
    this.viewport().scrollToIndex(line - 1);
  }

  /** Track function for `*cdkVirtualFor`: the line's id, so a recycled view is bound to the right line. */
  protected trackById(_index: number, line: LabM31LogLine): number {
    return line.id;
  }
}
