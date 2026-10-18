import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SwPush } from '@angular/service-worker';

/** Shows the last payload `SwPush.messages` delivered to this tab. */
@Component({
  selector: 'lab-m37-push',
  template: `
    <h2>Push lab</h2>
    <p data-testid="push-enabled">SwPush enabled: {{ push.isEnabled }}</p>
    <p data-testid="last-push">{{ last() }}</p>
  `,
})
export class LabM37Push {
  protected readonly push = inject(SwPush);
  protected readonly last = signal('no push yet');

  constructor() {
    this.push.messages.pipe(takeUntilDestroyed()).subscribe((message) => {
      this.last.set(JSON.stringify(message));
    });
  }
}
