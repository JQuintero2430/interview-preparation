import { Component, input } from '@angular/core';

/**
 * Exercise 33.2, the solution: the widget binds the HTML. Angular sanitizes it, then hands it to the sink as
 * `TrustedHTML` from its `angular` policy, so the page needs no policy name of its own.
 */
@Component({
  selector: 'lab-m33-ex2-bound-widget',
  template: `<div [innerHTML]="html()"></div>`,
})
export class LabM33Ex2BoundWidget {
  readonly html = input.required<string>();
}
