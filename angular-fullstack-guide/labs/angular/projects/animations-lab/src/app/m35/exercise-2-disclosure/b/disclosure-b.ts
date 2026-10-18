import { Component, signal } from '@angular/core';

// Exercise 35.2, variant b: `interpolate-size: allow-keywords` lets `height` transition between 0 and auto.
@Component({
  selector: 'lab-m35-disclosure-b',
  template: `
    <h1>Exercise 35.2b: disclosure with interpolate-size</h1>
    <button
      type="button"
      aria-controls="m35-disc-b"
      [attr.aria-expanded]="open()"
      (click)="open.set(!open())"
    >
      Toggle details
    </button>
    <div
      id="m35-disc-b"
      class="m35-disc-b"
      data-disclosure
      [class.m35-disc-open]="open()"
      [attr.inert]="open() ? null : ''"
    >
      <div class="m35-disc-b-content" data-content>
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
    .m35-disc-b {
      interpolate-size: allow-keywords;
      height: 0;
      overflow: hidden;
      background: #dbeafe;
      transition: height 800ms;
    }

    /* Keeps the paragraphs' margins inside the content box, so its height is the panel's. */
    .m35-disc-b-content {
      display: flow-root;
    }

    .m35-disc-open {
      height: auto;
    }
  `,
})
export class LabM35DisclosureB {
  protected readonly open = signal(false);
}
