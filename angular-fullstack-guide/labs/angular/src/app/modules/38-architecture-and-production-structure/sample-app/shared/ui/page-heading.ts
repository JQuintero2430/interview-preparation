import { Component, input } from '@angular/core';

/** Shared ui primitive: a heading that knows nothing about orders or catalog. */
@Component({
  selector: 'lab-m38-page-heading',
  template: `<h2>{{ text() }}</h2>`,
})
export class LabM38PageHeading {
  readonly text = input.required<string>();
}
