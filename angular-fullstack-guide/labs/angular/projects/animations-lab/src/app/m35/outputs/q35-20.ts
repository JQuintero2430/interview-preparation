import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

// Q35.20: a list card and a detail header that share one view-transition-name. The route `m35/outputs/q35-20/skipped`
// carries `data: { skipViewTransition: true }`, so the router hook skips that transition. The host attribute makes
// the global section 10 rules (scoped with `:root:has([data-m35-vt])`) apply.
@Component({
  selector: 'lab-m35-q35-20-list',
  host: { 'data-m35-vt': '' },
  imports: [RouterLink],
  template: `
    <h1>Q35.20: a shared element</h1>
    <a
      class="m35-q20-card"
      routerLink="/m35/outputs/q35-20/detail"
      style="view-transition-name: q20-card"
      >Card</a
    >
    <a routerLink="/m35/outputs/q35-20/skipped">Open the detail page, skipped</a>
  `,
  styles: `
    .m35-q20-card {
      display: inline-block;
      padding: 1rem 1.5rem;
      background: #dbeafe;
    }
  `,
})
export class LabM35Q3520 {}

/** The detail page: its header carries the card's name. */
@Component({
  selector: 'lab-m35-q35-20-detail',
  host: { 'data-m35-vt': '' },
  imports: [RouterLink],
  template: `
    <h1 class="m35-q20-header" style="view-transition-name: q20-card">Q35.20: the detail page</h1>
    <a routerLink="/m35/outputs/q35-20">Back to the list</a>
  `,
  styles: `
    .m35-q20-header {
      display: inline-block;
      padding: 1rem 1.5rem;
      background: #bfdbfe;
    }
  `,
})
export class LabM35Q3520Detail {}
