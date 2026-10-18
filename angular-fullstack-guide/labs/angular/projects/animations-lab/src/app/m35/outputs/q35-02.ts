import { Component, signal } from '@angular/core';

// Q35.02: one box whose class change starts a 400 ms transition on two properties.
@Component({
  selector: 'lab-m35-q35-02',
  template: `
    <h1>Q35.02: a class removed halfway</h1>
    <button type="button" (click)="on.set(!on())">Toggle class</button>
    <div class="m35-q02-box" [class.m35-q02-on]="on()" data-testid="q02-box">Box</div>
  `,
  styles: `
    .m35-q02-box {
      width: 12rem;
      padding: 1rem;
      margin-block: 1rem;
      background: #dbeafe;
      transition:
        opacity 400ms,
        transform 400ms;
    }

    .m35-q02-on {
      opacity: 0.2;
      transform: translateX(8rem);
    }
  `,
})
export class LabM35Q3502 {
  protected readonly on = signal(false);
}
