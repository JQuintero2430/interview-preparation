import { Component, signal } from '@angular/core';

/** Offline is a state, not an error: a banner in a live region follows the browser's online and offline events. */
@Component({
  selector: 'lab-m37-offline',
  host: { '(window:online)': 'online.set(true)', '(window:offline)': 'online.set(false)' },
  template: `
    <h2>Offline state</h2>
    <div role="status" data-testid="connection">
      @if (!online()) {
        <p data-testid="offline-banner">You are offline. Changes will be sent when the connection returns.</p>
      }
    </div>
  `,
})
export class LabM37Offline {
  protected readonly online = signal(navigator.onLine);
}
