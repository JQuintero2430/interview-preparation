import { ErrorHandler, Injectable, signal } from '@angular/core';

/** App-wide error handler: one instance for the whole app, so it is registered once, in core. */
@Injectable()
export class LabM38ErrorHandler implements ErrorHandler {
  readonly #messages = signal<readonly string[]>([]);
  readonly messages = this.#messages.asReadonly();

  handleError(error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    this.#messages.update((messages) => [...messages, message]);
  }
}
