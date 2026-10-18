import { Component, signal } from '@angular/core';

// Exercise 35.2, variant a: CSS Grid. The wrapper transitions its single row between 0fr and 1fr.
@Component({
  selector: 'lab-m35-disclosure-a',
  template: `
    <h1>Exercise 35.2a: disclosure with grid</h1>
    <button
      type="button"
      aria-controls="m35-disc-a"
      [attr.aria-expanded]="open()"
      (click)="open.set(!open())"
    >
      Toggle details
    </button>
    <div id="m35-disc-a" class="m35-disc" data-disclosure [class.m35-disc-open]="open()">
      <div class="m35-disc-content" data-content [attr.inert]="open() ? null : ''">
        <p>
          The panel grows to whatever its content needs. <a href="#more">A link inside</a> proves
          that closed content cannot take focus.
        </p>
        <p>A second paragraph, because the height is not known when the CSS is written.</p>
        <p>
          A third paragraph keeps the natural height well above zero, whatever the width of the
          window.
        </p>
      </div>
    </div>
  `,
  styles: `
    .m35-disc {
      display: grid;
      grid-template-rows: 0fr;
      background: #dbeafe;
      transition: grid-template-rows 800ms;
    }

    .m35-disc-open {
      grid-template-rows: 1fr;
    }

    .m35-disc-content {
      min-height: 0;
      overflow: hidden;
    }
  `,
})
export class LabM35DisclosureA {
  protected readonly open = signal(false);
}
