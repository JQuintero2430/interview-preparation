import { Component } from '@angular/core';
import { LabM37Ex3Chart, LabM37Ex3List, LabM37Ex3Profile } from '../widgets';

/** Variant a: one `@boundary` per widget; the reporter names the widget from `onViewError`'s details. */
@Component({
  selector: 'lab-m37-ex3-a-dashboard',
  imports: [LabM37Ex3Chart, LabM37Ex3List, LabM37Ex3Profile],
  template: `
    <section class="m37-widget" data-widget="chart">
      <h2>Chart</h2>
      @boundary {
        <lab-m37-ex3-chart />
      } @error {
        <p role="alert">Chart is unavailable.</p>
        <button type="button" (click)="$reset()">Retry</button>
      }
    </section>
    <section class="m37-widget" data-widget="list">
      <h2>List</h2>
      @boundary {
        <lab-m37-ex3-list />
      } @error {
        <p role="alert">List is unavailable.</p>
        <button type="button" (click)="$reset()">Retry</button>
      }
    </section>
    <section class="m37-widget" data-widget="profile">
      <h2>Profile</h2>
      @boundary {
        <lab-m37-ex3-profile />
      } @error {
        <p role="alert">Profile is unavailable.</p>
        <button type="button" (click)="$reset()">Retry</button>
      }
    </section>
  `,
})
export class LabM37Ex3ADashboard {}
