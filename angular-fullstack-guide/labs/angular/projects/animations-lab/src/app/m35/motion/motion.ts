import { type AnimationCallbackEvent, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { ViewTransitionLog } from '../../view-transition-log';

/** Media query a script animation checks itself: CSS rules cannot switch off element.animate(). */
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

// Section 11: performance and reduced motion. One bar animates its width, one its transform; a pulse is guarded by the
// media query; a note and a card leave with a class and a callback; a link navigates through the router's view
// transition. The checkbox switches the global reduced-motion rule for view transitions on and off (styles.css).
@Component({
  selector: 'lab-m35-motion',
  host: {
    'data-m35-motion': '',
    '[attr.data-m35-motion-guard]': 'guarded() ? "" : null',
  },
  imports: [RouterLink],
  template: `
    <h1>Section 11: performance and reduced motion</h1>

    <button type="button" (click)="widthRunning.set(true)">Animate width</button>
    <button type="button" (click)="moveRunning.set(true)">Animate transform</button>
    <div class="m35-meter" [class.m35-widen]="widthRunning()" data-testid="width-bar"></div>
    <div class="m35-meter" [class.m35-shift]="moveRunning()" data-testid="move-bar"></div>

    <p class="m35-pulse" data-testid="pulse">Guarded pulse</p>

    <button type="button" (click)="noteShown.set(false)">Remove note</button>
    @if (noteShown()) {
      <p animate.leave="m35-note-out" data-testid="note">Note with a reduced rule</p>
    }

    <button type="button" (click)="cardShown.set(false)">Remove card</button>
    @if (cardShown()) {
      <p class="m35-card" (animate.leave)="leaveCard($event)" data-testid="card">
        Card with a leave callback
      </p>
    }

    <label>
      <input type="checkbox" [checked]="guarded()" (change)="guarded.set(!guarded())" />
      Guard view transitions
    </label>
    <a routerLink="/m35/motion" [queryParams]="{ step: step() + 1 }">Next step</a>
    <p data-testid="step">Step {{ step() }}</p>
    <p data-testid="last-transition">{{ summary() }}</p>
  `,
  styles: `
    .m35-meter {
      width: 4rem;
      height: 1rem;
      margin-block: 0.5rem;
      background: #93c5fd;
    }

    .m35-card {
      width: 12rem;
      padding: 1rem;
      background: #dbeafe;
    }

    @keyframes m35-widen {
      to {
        width: 16rem;
      }
    }

    @keyframes m35-shift {
      to {
        transform: translateX(12rem);
      }
    }

    @keyframes m35-pulse {
      50% {
        opacity: 0.4;
      }
    }

    @keyframes m35-note-fade {
      to {
        opacity: 0;
      }
    }

    @media (prefers-reduced-motion: no-preference) {
      .m35-widen {
        animation: m35-widen 4000ms ease-in-out infinite alternate;
      }

      .m35-shift {
        animation: m35-shift 4000ms ease-in-out infinite alternate;
      }

      .m35-pulse {
        animation: m35-pulse 1500ms ease-in-out infinite;
      }
    }

    .m35-note-out {
      animation: m35-note-fade 1500ms forwards;
    }

    @media (prefers-reduced-motion: reduce) {
      .m35-note-out {
        animation: none;
      }
    }
  `,
})
export class LabM35Motion {
  private readonly log = inject(ViewTransitionLog);

  protected readonly widthRunning = signal(false);
  protected readonly moveRunning = signal(false);
  protected readonly noteShown = signal(true);
  protected readonly cardShown = signal(true);
  protected readonly guarded = signal(true);
  protected readonly step = toSignal(
    inject(ActivatedRoute).queryParamMap.pipe(map((params) => Number(params.get('step') ?? 0))),
    { requireSync: true },
  );

  protected summary(): string {
    const last = this.log.last();
    return last ? `${last.from} to ${last.to}, skipped: ${last.skipped}` : 'none';
  }

  /** Under reduced motion the card leaves at once; otherwise a script animation ends it. */
  protected leaveCard(event: AnimationCallbackEvent): void {
    if (matchMedia(REDUCED_MOTION_QUERY).matches) {
      event.animationComplete();
      return;
    }
    const animation = event.target.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 1500,
      fill: 'forwards',
    });
    animation.finished.then(event.animationComplete, event.animationComplete);
  }
}
