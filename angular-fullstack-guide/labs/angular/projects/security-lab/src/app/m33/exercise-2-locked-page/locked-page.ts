import { HttpClient } from '@angular/common/http';
import { Component, InjectionToken, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { LabM33Ex2BoundWidget } from './bound-widget';
import { LabM33Ex2LegacyWidget } from './legacy-widget';
import { LabM33Ex2PolicyWidget } from './policy-widget';

/** Which widget renders the comment: the starting point, the solution or the alternative. Given by the route. */
export const LAB_M33_EX2_WIDGET = new InjectionToken<'legacy' | 'bound' | 'policy'>(
  'LAB_M33_EX2_WIDGET',
);

/** What `GET /api/m33/ex2/comments` answers (server/security/ex2-locked-page.mjs). */
export interface LabM33Ex2Comment {
  html: string;
}

/**
 * Exercise 33.2: a comments page with one component style, whose comment HTML comes from the API and is shown by
 * a widget. The server sends the page under a strict CSP with Trusted Types enforced.
 */
@Component({
  selector: 'lab-m33-ex2-page',
  imports: [LabM33Ex2BoundWidget, LabM33Ex2LegacyWidget, LabM33Ex2PolicyWidget],
  template: `
    <h2>Locked page</h2>
    <section aria-label="Comments">
      @switch (widget) {
        @case ('legacy') {
          <lab-m33-ex2-legacy-widget [html]="comment()" />
        }
        @case ('bound') {
          <lab-m33-ex2-bound-widget [html]="comment()" />
        }
        @case ('policy') {
          <lab-m33-ex2-policy-widget [html]="comment()" />
        }
      }
    </section>
  `,
  styles: `
    h2 {
      color: rgb(0, 128, 0);
    }
  `,
})
export class LabM33Ex2Page {
  protected readonly widget = inject(LAB_M33_EX2_WIDGET);
  protected readonly comment = toSignal(
    inject(HttpClient)
      .get<LabM33Ex2Comment>('/api/m33/ex2/comments')
      .pipe(map((comment) => comment.html)),
    { initialValue: '' },
  );
}
