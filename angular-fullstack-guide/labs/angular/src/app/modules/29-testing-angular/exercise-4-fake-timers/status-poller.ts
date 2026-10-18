import { DestroyRef, inject, Injectable, signal } from '@angular/core';

/** The port to the status endpoint; a test provides a double at this class. */
export abstract class StatusApi {
  abstract get(): Promise<string>;
}

@Injectable()
export class StatusPoller {
  private readonly api = inject(StatusApi);
  private timer: ReturnType<typeof setInterval> | undefined;

  readonly status = signal('unknown');

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stop());
  }

  start(): void {
    if (this.timer === undefined) {
      this.timer = setInterval(() => {
        void this.api.get().then((status) => this.status.set(status));
      }, 5000);
    }
  }

  stop(): void {
    clearInterval(this.timer);
    this.timer = undefined;
  }
}
