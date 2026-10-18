import { Component, signal, type WritableSignal } from '@angular/core';

/** A child whose host element carries `animate.enter` as a host binding. */
@Component({
  selector: 'lab-m35-host-enter',
  host: { 'animate.enter': 'm35-host-in' },
  template: `Host binding`,
  styles: `
    :host {
      display: block;
      width: 12rem;
      padding: 1rem;
      margin-block: 1rem;
      background: #dbeafe;
    }

    :host(.m35-host-in) {
      animation: m35-host-slide 1500ms;
    }

    @keyframes m35-host-slide {
      from {
        transform: translateX(-2rem);
      }
    }
  `,
})
export class LabM35HostEnter {}

// Section 5: animate.enter and animate.leave with CSS classes. Angular adds the classes and decides when the
// element leaves the DOM; the browser runs every animation these classes start.
@Component({
  selector: 'lab-m35-enter-leave',
  imports: [LabM35HostEnter],
  template: `
    <h1>Section 5: enter and leave with classes</h1>

    <button type="button" (click)="toggle(enterShown)">Toggle enter box</button>
    @if (enterShown()) {
      <div class="m35-box" animate.enter="m35-enter-slide" data-testid="enter-box">Enter</div>
    }

    <button type="button" (click)="toggle(leaveShown)">Toggle leave box</button>
    @if (leaveShown()) {
      <div class="m35-box" animate.leave="m35-leave-fade" data-testid="leave-box">Leave</div>
    }

    <button type="button" (click)="toggle(plainShown)">Toggle plain box</button>
    @if (plainShown()) {
      <div class="m35-box" animate.leave="m35-leave-label" data-testid="plain-box">
        Nothing animates
      </div>
    }

    <button type="button" (click)="toggle(infiniteShown)">Toggle infinite box</button>
    @if (infiniteShown()) {
      <div class="m35-box" animate.leave="m35-leave-spin" data-testid="infinite-box">Infinite</div>
    }

    <button type="button" (click)="toggle(listsShown)">Toggle bound boxes</button>
    @if (listsShown()) {
      <div class="m35-box" [animate.enter]="arrayClasses" data-testid="array-box">Array</div>
      <div class="m35-box" [animate.enter]="signalClasses()" data-testid="signal-box">Signal</div>
    }

    <button type="button" (click)="toggle(hostShown)">Toggle host box</button>
    @if (hostShown()) {
      <lab-m35-host-enter data-testid="host-box" />
    }
  `,
  styles: `
    .m35-box {
      width: 12rem;
      padding: 1rem;
      margin-block: 1rem;
      background: #dbeafe;
    }

    /* The enter class holds the animation itself: the keyframes run from their own start state. */
    .m35-enter-slide {
      animation: m35-slide-in 1500ms;
    }

    .m35-leave-fade {
      animation: m35-fade-out 1500ms forwards;
    }

    /* A leave class that changes a colour only: no transition is declared, so nothing animates. */
    .m35-leave-label {
      color: #b91c1c;
    }

    /* An animation that never ends: the runtime does not wait for it. */
    .m35-leave-spin {
      animation: m35-turn 2s linear infinite;
    }

    /* Two classes that only work together: one names the keyframes, the other gives the duration. */
    .m35-array-a,
    .m35-sig-a {
      animation-name: m35-slide-in;
    }

    .m35-array-b,
    .m35-sig-b {
      animation-duration: 1500ms;
    }

    @keyframes m35-slide-in {
      from {
        opacity: 0;
        transform: translateX(-2rem);
      }
    }

    @keyframes m35-fade-out {
      to {
        opacity: 0;
      }
    }

    @keyframes m35-turn {
      to {
        transform: rotate(360deg);
      }
    }
  `,
})
export class LabM35EnterLeave {
  protected readonly enterShown = signal(false);
  protected readonly leaveShown = signal(true);
  protected readonly plainShown = signal(true);
  protected readonly infiniteShown = signal(true);
  protected readonly listsShown = signal(false);
  protected readonly hostShown = signal(false);
  protected readonly arrayClasses = ['m35-array-a', 'm35-array-b'];
  protected readonly signalClasses = signal('m35-sig-a m35-sig-b');

  protected toggle(shown: WritableSignal<boolean>): void {
    shown.update((value) => !value);
  }
}
