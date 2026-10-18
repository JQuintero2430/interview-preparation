import { Component, signal } from '@angular/core';

/** A child whose own template uses animate.leave. */
@Component({
  selector: 'lab-m35-q10-child',
  template: `<p animate.leave="m35-q10-out" data-testid="q10-child-inner">Child</p>`,
  styles: `
    .m35-q10-out {
      animation: m35-q10-fade 1500ms forwards;
    }

    @keyframes m35-q10-fade {
      to {
        opacity: 0;
      }
    }
  `,
})
export class LabM35Q10Child {}

// Q35.10: an @if block holding an element with animate.leave and a child component with its own.
@Component({
  selector: 'lab-m35-q35-10',
  imports: [LabM35Q10Child],
  template: `
    <h1>Q35.10: a block with two leaves</h1>
    <button type="button" (click)="shown.set(false)">Remove block</button>
    @if (shown()) {
      <section class="m35-q10-block" data-testid="q10-block">
        <p animate.leave="m35-q10-line-out" data-testid="q10-line">Same template</p>
        <lab-m35-q10-child />
      </section>
    }
  `,
  styles: `
    .m35-q10-block {
      width: 12rem;
      padding: 1rem;
      margin-block: 1rem;
      background: #dbeafe;
    }

    .m35-q10-line-out {
      animation: m35-q10-line-fade 1500ms forwards;
    }

    @keyframes m35-q10-line-fade {
      to {
        opacity: 0;
      }
    }
  `,
})
export class LabM35Q3510 {
  protected readonly shown = signal(true);
}
