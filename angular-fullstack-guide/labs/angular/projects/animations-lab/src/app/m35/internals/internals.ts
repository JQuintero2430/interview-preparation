import { ApplicationRef, Component, inject, signal } from '@angular/core';

// Section 12: under the hood. A removed @if keeps its element attached while the leave classes animate;
// the page reports when ApplicationRef is stable after the removal, so a test can look at the DOM at that point.
@Component({
  selector: 'lab-m35-internals',
  template: `
    <h1>Section 12: under the hood</h1>

    <button type="button" (click)="hideNote()">Hide the note</button>
    <button type="button" (click)="noteShown.set(!noteShown())">Toggle the note</button>
    @if (noteShown()) {
      <p class="m35-internals-box" animate.leave="m35-internals-out" data-testid="note">Note</p>
    }
    <p data-testid="stable-status">
      Stable after removal: {{ stableAfterRemoval() ? 'yes' : 'no' }}
    </p>

    <button type="button" (click)="removeBoth()">Remove both cards</button>
    @if (firstShown()) {
      <p class="m35-internals-box" animate.leave="m35-internals-out" data-testid="card-1">Card 1</p>
    }
    @if (secondShown()) {
      <p class="m35-internals-box" animate.leave="m35-internals-out" data-testid="card-2">Card 2</p>
    }
  `,
  styles: `
    .m35-internals-box {
      width: 12rem;
      padding: 0.5rem 1rem;
      background: #dcfce7;
    }

    .m35-internals-out {
      animation: m35-internals-fade 1500ms forwards;
    }

    @keyframes m35-internals-fade {
      to {
        opacity: 0;
        transform: translateY(1rem);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .m35-internals-out {
        animation: none;
      }
    }
  `,
})
export class LabM35Internals {
  private readonly appRef = inject(ApplicationRef);

  protected readonly noteShown = signal(true);
  protected readonly stableAfterRemoval = signal(false);
  protected readonly firstShown = signal(true);
  protected readonly secondShown = signal(true);

  /** Removes the note from the model, then records when the application is stable again. */
  protected hideNote(): void {
    this.noteShown.set(false);
    void this.appRef.whenStable().then(() => this.stableAfterRemoval.set(true));
  }

  /** Two removals in one event handler, so one change detection detaches both. */
  protected removeBoth(): void {
    this.firstShown.set(false);
    this.secondShown.set(false);
  }
}
