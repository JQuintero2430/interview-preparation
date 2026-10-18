import { type AnimationCallbackEvent, Component, signal } from '@angular/core';

// Section 9: the panel after the migration (same markup as legacy-panel.ts), and the docs' "disable" class
// applied to a class-form leave and to a leave callback that waits for animationend.
@Component({
  selector: 'lab-m35-migration',
  template: `
    <h1>Section 9: migration</h1>
    <button type="button" (click)="toggle()">Toggle panel</button>
    <div
      class="m35-mig-panel"
      data-testid="mig-panel"
      [class.m35-closed]="panelState() === 'closed'"
    >
      Panel is {{ panelState() }}
    </div>

    <h2>Disabling motion</h2>
    <label><input type="checkbox" (change)="still.set(!still())" /> Disable motion</label>
    <section [class.m35-still]="still()">
      @if (notesShown()) {
        <p data-testid="class-note" animate.leave="m35-note-out">Class-form note</p>
        <p data-testid="callback-note" (animate.leave)="leaveOnAnimationEnd($event)">
          Callback note
        </p>
      }
    </section>
    <button type="button" (click)="notesShown.set(false)">Remove notes</button>
  `,
  styles: `
    .m35-mig-panel {
      overflow: hidden;
      background: #dbeafe;
      padding: 0.5rem;
      opacity: 1;
      height: 80px;
      transition:
        opacity 900ms ease,
        height 900ms ease;
    }
    .m35-mig-panel.m35-closed {
      opacity: 0.3;
      height: 20px;
    }
    .m35-note-out,
    .m35-note-cb-out {
      animation: m35-note-fade 20000ms ease-in forwards;
    }
    /* The migration guide's "disable" class, scoped to a section of the page. */
    .m35-still .m35-note-out,
    .m35-still .m35-note-cb-out {
      animation: none !important;
      transition: none !important;
    }
    @keyframes m35-note-fade {
      to {
        opacity: 0;
      }
    }
  `,
})
export class LabM35Migration {
  protected readonly panelState = signal<'open' | 'closed'>('open');
  protected readonly still = signal(false);
  protected readonly notesShown = signal(true);

  protected toggle(): void {
    this.panelState.update((current) => (current === 'open' ? 'closed' : 'open'));
  }

  /** Completes the leave on the element's animationend, as code written against animation events does. */
  protected leaveOnAnimationEnd(event: AnimationCallbackEvent): void {
    event.target.setAttribute('data-leaving', 'true');
    event.target.addEventListener('animationend', () => event.animationComplete(), { once: true });
    event.target.classList.add('m35-note-cb-out');
  }
}
