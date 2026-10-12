import { Component, inject } from '@angular/core';
import { LabM24NavigationStatus } from './navigation-status';

/** A bar that exists in the DOM only while a navigation runs. */
@Component({
  selector: 'lab-m24-progress-bar',
  template: `@if (status.busy()) {
    <div class="bar" role="progressbar" aria-label="Loading page"></div>
  }`,
})
export class LabM24ProgressBar {
  protected readonly status = inject(LabM24NavigationStatus);
}
