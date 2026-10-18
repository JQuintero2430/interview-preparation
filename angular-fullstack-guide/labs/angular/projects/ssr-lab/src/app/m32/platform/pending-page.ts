import { Component, inject, PendingTasks, signal } from '@angular/core';

/** Work started in the constructor is registered as a pending task, so the server waits for it. */
@Component({
  selector: 'lab-m32-platform-pending',
  template: `<h2>Platform: pending task</h2><p>Message: <output aria-label="Message">{{ message() }}</output></p>`,
})
export class LabM32PlatformPending {
  protected readonly message = signal('waiting');

  constructor() {
    inject(PendingTasks).run(async () => {
      await new Promise<void>((resolve) => setTimeout(resolve, 20));
      this.message.set('loaded by a pending task');
    });
  }
}
