import { Component, ElementRef, signal, viewChild } from '@angular/core';

/** Media query a script animation checks itself: CSS rules cannot switch off element.animate(). */
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

// Section 4: the Web Animations API. Angular only wires buttons to element.animate() and the Animation it returns;
// the browser creates, runs and lists every animation, CSS ones included.
@Component({
  selector: 'lab-m35-waapi',
  template: `
    <h1>Section 4: the Web Animations API</h1>

    <button type="button" (click)="startBoth()">Start both</button>
    <div #both class="m35-box m35-slide-box" [class.m35-shifted]="shifted()" data-testid="both-box">
      Transition and script
    </div>
    <output data-testid="animate-result">{{ created() }}</output>

    <button type="button" (click)="finishRun()">Run and finish</button>
    <button type="button" (click)="cancelRun()">Run and cancel</button>
    <div #outcome class="m35-box" data-testid="outcome-box">Finished promise</div>
    <output data-testid="finished-result">{{ outcomeText() }}</output>

    <button type="button" (click)="keepEnds()">Keep end styles</button>
    <div #forwards class="m35-box" data-testid="forwards-only-box">fill forwards only</div>
    <div #committed class="m35-box" data-testid="committed-box">commitStyles, then cancel</div>

    <div class="m35-spinner" data-testid="spinner"></div>
    <button type="button" (click)="startScript()">Start script animation</button>
    <button type="button" (click)="setAll('pause')">Pause all</button>
    <button type="button" (click)="setAll('play')">Play all</button>
    <div #scripted class="m35-box" data-testid="script-box">Script</div>
  `,
  styles: `
    .m35-box {
      width: 12rem;
      padding: 1rem;
      margin-block: 1rem;
      background: #dbeafe;
    }

    /* A CSS transition on transform; the script animation on the same element moves opacity. */
    .m35-slide-box {
      transition: transform 800ms;
    }

    .m35-shifted {
      transform: translateX(4rem);
    }

    /* A CSS keyframe animation that never ends: getAnimations() lists it next to script animations. */
    .m35-spinner {
      width: 2rem;
      height: 2rem;
      margin-block: 1rem;
      background: #1d4ed8;
      animation: m35-spin 2s linear infinite;
    }

    @keyframes m35-spin {
      to {
        transform: rotate(360deg);
      }
    }
  `,
})
export class LabM35Waapi {
  protected readonly shifted = signal(false);
  protected readonly created = signal('');
  protected readonly outcomeText = signal('');
  private readonly both = viewChild.required<ElementRef<HTMLElement>>('both');
  private readonly outcome = viewChild.required<ElementRef<HTMLElement>>('outcome');
  private readonly forwards = viewChild.required<ElementRef<HTMLElement>>('forwards');
  private readonly committed = viewChild.required<ElementRef<HTMLElement>>('committed');
  private readonly scripted = viewChild.required<ElementRef<HTMLElement>>('scripted');

  /** A CSS transition (class toggle) and a script animation on one element. */
  protected startBoth(): void {
    this.shifted.set(true);
    if (matchMedia(REDUCED_MOTION_QUERY).matches) return;
    const animation = this.both().nativeElement.animate([{ opacity: 1 }, { opacity: 0.5 }], {
      duration: 2000,
    });
    this.created.set(`animate() returned ${animation.constructor.name}, ${animation.playState}`);
  }

  /** finished resolves, with the Animation itself, once the animation finishes. */
  protected async finishRun(): Promise<void> {
    if (matchMedia(REDUCED_MOTION_QUERY).matches) return;
    const animation = this.outcome().nativeElement.animate([{ opacity: 1 }, { opacity: 0.5 }], {
      duration: 2000,
    });
    animation.finish();
    const settled = await animation.finished;
    this.outcomeText.set(settled === animation ? 'finished resolved with the Animation' : 'other');
  }

  /** finished rejects with an AbortError when a running animation is cancelled. */
  protected async cancelRun(): Promise<void> {
    if (matchMedia(REDUCED_MOTION_QUERY).matches) return;
    const animation = this.outcome().nativeElement.animate([{ opacity: 1 }, { opacity: 0.5 }], {
      duration: 2000,
    });
    // Hold the promise before cancelling: this is the one that rejects.
    const finished = animation.finished;
    animation.cancel();
    try {
      await finished;
      this.outcomeText.set('finished resolved');
    } catch (error) {
      this.outcomeText.set(
        `finished rejected with ${error instanceof DOMException ? error.name : 'other'}`,
      );
    }
  }

  /** Two ways to keep an end style: fill forwards alone, and commitStyles then cancel. */
  protected keepEnds(): void {
    if (matchMedia(REDUCED_MOTION_QUERY).matches) return;
    const keyframes = [{ opacity: 1 }, { opacity: 0.4 }];
    const forwards = this.forwards().nativeElement.animate(keyframes, {
      duration: 2000,
      fill: 'forwards',
    });
    forwards.finish();
    const committed = this.committed().nativeElement.animate(keyframes, {
      duration: 2000,
      fill: 'forwards',
    });
    committed.finish();
    committed.commitStyles();
    committed.cancel();
  }

  protected startScript(): void {
    if (matchMedia(REDUCED_MOTION_QUERY).matches) return;
    this.scripted().nativeElement.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.2)' }],
      {
        duration: 20000,
      },
    );
  }

  /** The dashboard's pause-all button: getAnimations() lists CSS and script animations alike. */
  protected setAll(action: 'pause' | 'play'): void {
    for (const animation of document.getAnimations()) animation[action]();
  }
}
