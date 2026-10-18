import { Component, signal } from '@angular/core';

// Q35.06: the enter class runs a short fade and a long slide at once.
@Component({
  selector: 'lab-m35-q35-06',
  template: `
    <h1>Q35.06: two animations in one enter class</h1>
    <button type="button" (click)="shown.set(!shown())">Toggle box</button>
    @if (shown()) {
      <div class="m35-q06-box" animate.enter="m35-pop" data-testid="q06-box">Box</div>
    }
  `,
  styles: `
    .m35-q06-box {
      width: 12rem;
      padding: 1rem;
      margin-block: 1rem;
      background: #dbeafe;
    }

    .m35-pop {
      animation:
        m35-pop-fade 400ms,
        m35-pop-slide 1500ms;
    }

    @keyframes m35-pop-fade {
      from {
        opacity: 0;
      }
    }

    @keyframes m35-pop-slide {
      from {
        transform: translateX(-2rem);
      }
    }
  `,
})
export class LabM35Q3506 {
  protected readonly shown = signal(false);
}
