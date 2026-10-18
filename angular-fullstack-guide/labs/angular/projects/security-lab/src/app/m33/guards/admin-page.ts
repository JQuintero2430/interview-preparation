import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { LabM33GuardSession } from './session';

/** Section 10: the lazy admin page. Its chunk is a static file; the marker is how the test finds that file. */
@Component({
  selector: 'lab-m33-guards-admin',
  template: `
    <h2>Admin area</h2>
    <p>Build marker: <code>{{ marker }}</code></p>
    <button type="button" (click)="loadReport()">Load report</button>
    <p role="status">{{ status() }}</p>
  `,
})
export default class LabM33GuardsAdmin {
  private readonly session = inject(LabM33GuardSession);
  protected readonly marker = 'LAB_M33_ADMIN_CHUNK';
  protected readonly status = signal('No report yet');

  protected loadReport(): void {
    this.session.loadReport().subscribe({
      next: () => this.status.set('Report loaded'),
      error: (error: HttpErrorResponse) => this.status.set(`Report failed: ${error.status}`),
    });
  }
}
