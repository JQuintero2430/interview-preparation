import { Component, signal } from '@angular/core';

// Section 2: CSS transitions. One box per behavior; Angular only flips signals, the browser runs every transition.
@Component({
  selector: 'lab-m35-transitions',
  template: `
    <h1>Section 2: CSS transitions</h1>

    <div class="m35-box m35-listed" [class.m35-on]="on()" data-testid="listed-box">
      Listed properties
    </div>
    <button type="button" (click)="on.set(!on())">Toggle class</button>

    <button type="button" (click)="inserted.set(!inserted())">Toggle inserted boxes</button>
    @if (inserted()) {
      <div class="m35-box m35-with-start" data-testid="with-start-box">With @starting-style</div>
      <div class="m35-box m35-without-start" data-testid="without-start-box">
        Without @starting-style
      </div>
    }

    <button type="button" (click)="hidden.set(!hidden())">Toggle display none</button>
    <div class="m35-box m35-discrete" [class.m35-gone]="hidden()" data-testid="discrete-box">
      allow-discrete
    </div>
    <div class="m35-box m35-plain" [class.m35-gone]="hidden()" data-testid="plain-box">
      No allow-discrete
    </div>
  `,
  styles: `
    .m35-box {
      width: 12rem;
      padding: 1rem;
      margin-block: 1rem;
      background: #dbeafe;
    }

    /* A list of properties: only opacity and transform transition; background-color changes at once. */
    .m35-listed {
      transition:
        opacity 600ms ease-out 400ms,
        transform 600ms ease-out 400ms;
    }

    .m35-listed.m35-on {
      opacity: 0.4;
      transform: translateX(8rem);
      background: #fecaca;
    }

    /* An inserted element has no previous style: only @starting-style supplies the "before" value. */
    .m35-with-start,
    .m35-without-start {
      transition: opacity 600ms;
    }

    .m35-with-start {
      @starting-style {
        opacity: 0;
      }
    }

    /* display is a discrete property: it transitions only with transition-behavior: allow-discrete. */
    .m35-discrete {
      transition:
        opacity 600ms,
        display 600ms allow-discrete;
    }

    .m35-plain {
      transition: opacity 600ms;
    }

    .m35-gone {
      opacity: 0;
      display: none;
    }
  `,
})
export class LabM35Transitions {
  protected readonly on = signal(false);
  protected readonly inserted = signal(false);
  protected readonly hidden = signal(false);
}
