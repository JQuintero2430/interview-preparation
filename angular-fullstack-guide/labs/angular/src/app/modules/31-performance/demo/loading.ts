import { Component } from '@angular/core';
import { LabM31HeavyPanel } from './heavy-panel';

/**
 * Loading lab page: the report panel sits in a `@defer` block whose trigger is the button,
 * so its chunk is requested only when the user interacts with that button.
 */
@Component({
  selector: 'lab-m31-loading',
  imports: [LabM31HeavyPanel],
  template: `
    <h1>Loading lab</h1>
    <button type="button" #showReport>Show the quarterly report</button>
    @defer (on interaction(showReport)) {
      <lab-m31-heavy-panel />
    } @placeholder {
      <p>The report loads when you ask for it.</p>
    }
  `,
})
export class LabM31Loading {}
