import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Section 6: an `[innerHTML]` binding (Angular sanitizes the value, then hands it over through its `angular`
 * policy) next to a "legacy widget" that writes `innerHTML` itself with a plain string, the sink Trusted Types guard.
 */
@Component({
  selector: 'lab-m33-tt',
  imports: [RouterLink],
  template: `
    <h2>Trusted Types</h2>
    <section aria-label="Sanitized binding"><div [innerHTML]="html"></div></section>
    <section aria-label="Legacy widget">
      <button type="button" (click)="runWidget()">Run the legacy widget</button>
      <div #widget></div>
      <p role="status">{{ widgetResult() }}</p>
    </section>
    <a routerLink="lazy">Open the lazy page</a>
  `,
})
export class LabM33TtPage {
  protected readonly html = '<b>Sanitized</b><script>window.__m33Hits=1</script>';
  protected readonly widgetResult = signal('not run');
  private readonly widget = viewChild.required<ElementRef<HTMLElement>>('widget');

  protected runWidget(): void {
    try {
      // The hole Trusted Types close: a plain string straight into a sink.
      this.widget().nativeElement.innerHTML = '<em>Widget output</em>';
      this.widgetResult.set('written');
    } catch (error) {
      this.widgetResult.set(
        error instanceof Error ? `${error.name}: ${error.message}` : String(error),
      );
    }
  }
}
