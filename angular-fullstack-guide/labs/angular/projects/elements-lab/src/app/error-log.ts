import { ErrorHandler, Injectable, signal } from '@angular/core';

/** One reported error. */
export interface LabErrorEntry {
  message: string;
  source: string;
}

/** The lab's `ErrorHandler`: keeps what it was given and renders nothing itself. */
@Injectable()
export class LabErrorLog extends ErrorHandler {
  readonly entries = signal<LabErrorEntry[]>([]);

  override handleError(error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    const source = error instanceof Error ? error.name : typeof error;
    this.entries.update((entries) => [...entries, { message, source }]);
  }
}
