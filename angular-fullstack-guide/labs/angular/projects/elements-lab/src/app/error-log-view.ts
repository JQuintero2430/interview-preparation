import { Component, ErrorHandler, inject, signal } from '@angular/core';
import { LabErrorEntry, LabErrorLog } from './error-log';

@Component({
  selector: 'lab-error-log-view',
  template: `
    <ol data-testid="error-log">
      @for (entry of entries(); track $index) {
        <li>{{ entry.source }}: {{ entry.message }}</li>
      }
    </ol>
  `,
})
export class LabErrorLogView {
  private readonly handler = inject(ErrorHandler);
  // The app config provides `LabErrorLog` as the `ErrorHandler`; any other handler shows an empty list.
  protected readonly entries = this.handler instanceof LabErrorLog ? this.handler.entries : signal<LabErrorEntry[]>([]);
}
