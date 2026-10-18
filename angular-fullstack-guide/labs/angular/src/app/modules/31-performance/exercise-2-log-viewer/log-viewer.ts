import { Component, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LAB_M31_LINE_COUNT, parseLineNumber } from './log-lines';
import { LabM31LogViewerCdk } from './log-viewer-cdk';
import { LabM31LogViewerWindow } from './log-viewer-window';

/** Query value that selects the hand-written window; anything else selects the CDK. */
const WINDOW_VARIANT = 'window';

const JUMP_ERROR = `Enter a whole line number from 1 to ${LAB_M31_LINE_COUNT.toLocaleString('en-US')}.`;

/** Log viewer lab page: `?variant=cdk` (default) or `?variant=window`, plus a "jump to line" form. */
@Component({
  selector: 'lab-m31-log-viewer',
  imports: [LabM31LogViewerCdk, LabM31LogViewerWindow],
  template: `
    <h1>Log viewer lab</h1>
    <form (submit)="onJump($event, target.value)">
      <label for="log-viewer-target">Jump to line</label>
      <input id="log-viewer-target" #target type="text" inputmode="numeric" />
      <button type="submit">Go to line</button>
    </form>
    <p role="alert" aria-live="assertive">{{ error() }}</p>
    @if (windowed) {
      <lab-m31-log-viewer-window />
    } @else {
      <lab-m31-log-viewer-cdk />
    }
  `,
})
export class LabM31LogViewer {
  protected readonly windowed = inject(ActivatedRoute).snapshot.queryParamMap.get('variant') === WINDOW_VARIANT;
  protected readonly error = signal('');
  private readonly cdkViewer = viewChild(LabM31LogViewerCdk);
  private readonly windowViewer = viewChild(LabM31LogViewerWindow);

  /** Validates the typed line and asks whichever variant is on screen to scroll there. */
  protected onJump(event: Event, text: string): void {
    event.preventDefault();
    const line = parseLineNumber(text);
    this.error.set(line === null ? JUMP_ERROR : '');
    if (line === null) return;
    (this.cdkViewer() ?? this.windowViewer())?.jumpTo(line);
  }
}
