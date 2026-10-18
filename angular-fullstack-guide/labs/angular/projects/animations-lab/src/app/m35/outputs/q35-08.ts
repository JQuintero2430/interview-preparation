import { Component, signal, type WritableSignal } from '@angular/core';

// Q35.08: three leave classes, one that animates nothing, one with a transition and one with an infinite animation.
@Component({
  selector: 'lab-m35-q35-08',
  template: `
    <h1>Q35.08: three kinds of leave class</h1>

    <button type="button" (click)="toggle(plainShown)">Toggle plain box</button>
    @if (plainShown()) {
      <div class="m35-q08-box" animate.leave="m35-q08-plain" data-testid="q08-plain">Plain</div>
    }

    <button type="button" (click)="toggle(fadeShown)">Toggle transition box</button>
    @if (fadeShown()) {
      <div class="m35-q08-box" animate.leave="m35-q08-fade" data-testid="q08-fade">Transition</div>
    }

    <button type="button" (click)="toggle(spinShown)">Toggle infinite box</button>
    @if (spinShown()) {
      <div class="m35-q08-box" animate.leave="m35-q08-spin" data-testid="q08-spin">Infinite</div>
    }
  `,
  styles: `
    .m35-q08-box {
      width: 12rem;
      padding: 1rem;
      margin-block: 1rem;
      background: #dbeafe;
    }

    /* Changes a colour and declares no transition: nothing animates. */
    .m35-q08-plain {
      color: #b91c1c;
    }

    .m35-q08-fade {
      opacity: 0;
      transition: opacity 1500ms;
    }

    .m35-q08-spin {
      animation: m35-q08-turn 2s linear infinite;
    }

    @keyframes m35-q08-turn {
      to {
        transform: rotate(360deg);
      }
    }
  `,
})
export class LabM35Q3508 {
  protected readonly plainShown = signal(true);
  protected readonly fadeShown = signal(true);
  protected readonly spinShown = signal(true);

  protected toggle(shown: WritableSignal<boolean>): void {
    shown.update((value) => !value);
  }
}
