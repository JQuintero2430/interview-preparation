import { afterNextRender, Component, ElementRef, inject, viewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

/**
 * A search page that echoes `?q=` four ways (Section 2): interpolation, an `[innerHTML]` binding and a
 * `[textContent]` binding go through the template; the fourth writes `nativeElement.innerHTML` itself.
 * That last write is the only direct DOM write of the lab outside Section 6 and the exercises.
 */
@Component({
  selector: 'lab-m33-xss-sinks',
  template: `
    <h2>Search results</h2>
    <section aria-label="Interpolation"><p>{{ query }}</p></section>
    <section aria-label="innerHTML binding"><p [innerHTML]="query"></p></section>
    <section aria-label="textContent binding"><p [textContent]="query"></p></section>
    <section aria-label="Direct innerHTML write"><p #direct></p></section>
  `,
})
export class LabM33XssSinks {
  protected readonly query = inject(ActivatedRoute).snapshot.queryParamMap.get('q') ?? '';
  private readonly direct = viewChild.required<ElementRef<HTMLElement>>('direct');

  constructor() {
    afterNextRender(() => {
      // The hole: Angular never sees this string, so nothing sanitizes it.
      this.direct().nativeElement.innerHTML = this.query;
    });
  }
}
