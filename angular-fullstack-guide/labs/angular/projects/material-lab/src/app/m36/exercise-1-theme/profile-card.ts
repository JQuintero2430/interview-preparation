import { Component } from '@angular/core';

/** A custom card on system variables only: no Material import, no color of its own. */
@Component({
  selector: 'lab-m36-profile-card',
  host: { role: 'region', 'aria-label': 'Profile card' },
  styles: `
    :host {
      display: block;
      padding: 1rem;
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 0.75rem;
      background-color: var(--mat-sys-surface-container);
      color: var(--mat-sys-on-surface);
    }

    h2,
    p {
      margin: 0;
    }
  `,
  template: `
    <h2>Ada Lovelace</h2>
    <p>Analyst</p>
  `,
})
export class LabM36ProfileCard {}
