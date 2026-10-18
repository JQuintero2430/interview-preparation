import { Component, signal } from '@angular/core';

// Section 3: CSS keyframe animations. Angular only flips signals; the browser runs every animation.
// The global class `.m35-global-grow` (styles.css) names the keyframes `m35-grow` that this component declares.
@Component({
  selector: 'lab-m35-keyframes',
  template: `
    <h1>Section 3: CSS keyframe animations</h1>

    <button type="button" (click)="fade.set(true)">Start fades</button>
    <div class="m35-box" [class.m35-fade-forwards]="fade()" data-testid="forwards-box">
      Fill mode forwards
    </div>
    <div class="m35-box" [class.m35-fade-plain]="fade()" data-testid="plain-box">No fill mode</div>

    <button type="button" (click)="iterate.set(true)">Start three iterations</button>
    <div class="m35-box" [class.m35-iterating]="iterate()" data-testid="iterating-box">
      Three iterations
    </div>

    <button type="button" (click)="grow.set(true)">Start both grows</button>
    <div class="m35-box" [class.m35-grow-local]="grow()" data-testid="local-box">
      Component class
    </div>
    <div class="m35-box" [class.m35-global-grow]="grow()" data-testid="global-box">
      Global class
    </div>
  `,
  styles: `
    .m35-box {
      width: 12rem;
      padding: 1rem;
      margin-block: 1rem;
      background: #dbeafe;
    }

    /* The same keyframes, with and without a fill mode: only forwards keeps the last keyframe. */
    .m35-fade-forwards {
      animation: m35-fade 800ms forwards;
    }

    .m35-fade-plain {
      animation: m35-fade 800ms;
    }

    @keyframes m35-fade {
      from {
        opacity: 1;
      }
      to {
        opacity: 0.3;
      }
    }

    /* Three iterations of 1000 ms: animationiteration fires between iterations, animationend after the last. */
    .m35-iterating {
      animation: m35-slide 1000ms linear 3;
    }

    @keyframes m35-slide {
      from {
        transform: translateX(0);
      }
      to {
        transform: translateX(4rem);
      }
    }

    /* Declared here, so Emulated encapsulation renames it; a global class cannot name it. */
    .m35-grow-local {
      animation: m35-grow 800ms;
    }

    @keyframes m35-grow {
      from {
        transform: scale(1);
      }
      to {
        transform: scale(1.2);
      }
    }
  `,
})
export class LabM35Keyframes {
  protected readonly fade = signal(false);
  protected readonly iterate = signal(false);
  protected readonly grow = signal(false);
}
