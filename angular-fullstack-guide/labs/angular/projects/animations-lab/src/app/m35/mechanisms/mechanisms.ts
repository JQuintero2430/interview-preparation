import {
  ANIMATION_MODULE_TYPE,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';

/** Media query a script animation checks itself: CSS rules cannot switch off element.animate(). */
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

// Section 1: one box per browser mechanism. Angular only flips a class or calls element.animate();
// the browser creates and runs each Animation.
@Component({
  selector: 'lab-m35-mechanisms',
  template: `
    <h1>Section 1: three animation mechanisms</h1>
    <p>Animation provider: {{ provider }}</p>

    <div
      class="m35-box m35-box-transition"
      [class.m35-moved]="moved()"
      data-testid="transition-box"
    >
      Transition
    </div>
    <button type="button" (click)="moved.set(!moved())">Start transition</button>

    <div
      class="m35-box m35-box-keyframes"
      [class.m35-pulsing]="pulsing()"
      data-testid="keyframes-box"
    >
      Keyframes
    </div>
    <button type="button" (click)="pulsing.set(true)">Start keyframe animation</button>

    <div #scripted class="m35-box" data-testid="script-box">Script</div>
    <button type="button" (click)="runScript()">Start script animation</button>
  `,
  styles: `
    .m35-box {
      width: 8rem;
      padding: 1rem;
      margin-block: 1rem;
      background: #dbeafe;
    }

    /* 1. CSS transition: the browser animates transform when its computed value changes. */
    .m35-box-transition {
      transition: transform 1s ease-out;
    }

    .m35-moved {
      transform: translateX(12rem);
    }

    /* 2. CSS keyframe animation: runs when the animation property applies. */
    .m35-pulsing {
      animation: m35-pulse 1s ease-in-out;
    }

    @keyframes m35-pulse {
      50% {
        transform: scale(1.2);
      }
    }
  `,
})
export class LabM35Mechanisms {
  /** Which legacy animation module is loaded: null in the native build (no provider supplies the token). */
  protected readonly provider = String(inject(ANIMATION_MODULE_TYPE, { optional: true }));
  protected readonly moved = signal(false);
  protected readonly pulsing = signal(false);
  private readonly scripted = viewChild.required<ElementRef<HTMLElement>>('scripted');

  /** 3. Web Animations API: script creates the Animation object itself. */
  protected runScript(): void {
    if (matchMedia(REDUCED_MOTION_QUERY).matches) return;
    this.scripted().nativeElement.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.2)' }, { transform: 'scale(1)' }],
      {
        duration: 1000,
        easing: 'ease-in-out',
      },
    );
  }
}
