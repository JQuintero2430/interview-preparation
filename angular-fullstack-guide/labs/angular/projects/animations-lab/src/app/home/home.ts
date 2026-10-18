import { Component, signal } from '@angular/core';

@Component({
  selector: 'lab-motion-home',
  template: `
    <h1>Module 35 animations lab</h1>
    <button type="button" (click)="shown.set(!shown())">Toggle message</button>
    @if (shown()) {
      <p animate.enter="m35-fade-in">The message entered with a 400 ms fade.</p>
    }
  `,
  styles: `
    .m35-fade-in {
      animation: m35-fade 400ms ease-out;
    }

    @keyframes m35-fade {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  `,
})
export class LabMotionHome {
  protected readonly shown = signal(false);
}
