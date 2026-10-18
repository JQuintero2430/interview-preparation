import {
  type AnimationCallbackEvent,
  Component,
  inject,
  signal,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { LabM35TimeoutReads } from './short-timeout';

/** Media query a script animation checks itself: CSS rules cannot switch off element.animate(). */
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/** A child component with its own animate.leave inside its own template. */
@Component({
  selector: 'lab-m35-callback-child',
  template: `<p class="m35-inner" animate.leave="m35-inner-out" data-testid="child-inner">
    Child
  </p>`,
  styles: `
    .m35-inner-out {
      animation: m35-inner-fade 1500ms forwards;
    }

    @keyframes m35-inner-fade {
      to {
        opacity: 0;
      }
    }
  `,
})
export class LabM35CallbackChild {}

/** A component created at run time; its own host binding carries animate.leave. */
@Component({
  selector: 'lab-m35-dynamic-card',
  host: { 'animate.leave': 'm35-dynamic-out', 'data-testid': 'dynamic-card' },
  template: `Dynamic card`,
  styles: `
    :host {
      display: block;
      width: 12rem;
      padding: 1rem;
      background: #dbeafe;
    }

    :host(.m35-dynamic-out) {
      animation: m35-dynamic-fade 1500ms forwards;
    }

    @keyframes m35-dynamic-fade {
      to {
        opacity: 0;
      }
    }
  `,
})
export class LabM35DynamicCard {}

// Section 6: function callbacks and nested leaves. A leave callback decides when the element may go; a removed
// node also waits for the leave animations below it in the same template, but not inside child components.
@Component({
  selector: 'lab-m35-callbacks',
  imports: [LabM35CallbackChild],
  template: `
    <h1>Section 6: function callbacks and nested leaves</h1>

    <button type="button" (click)="manualShown.set(false)">Remove manual box</button>
    <button type="button" (click)="completeLeave()">Complete leave</button>
    @if (manualShown()) {
      <div class="m35-box" (animate.leave)="holdLeave($event)" data-testid="manual-box">Manual</div>
    }
    <output data-testid="callback-target">{{ callbackTarget() }}</output>

    <button type="button" (click)="forgottenShown.set(false)">Remove forgotten box</button>
    @if (forgottenShown()) {
      <div class="m35-box" (animate.leave)="forgetLeave($event)" data-testid="forgotten-box">
        Forgotten
      </div>
    }
    <button type="button" (click)="showTimeoutReads()">Show timeout reads</button>
    <output data-testid="timeout-reads">{{ timeoutReads() }}</output>

    <button type="button" (click)="scriptedShown.set(false)">Remove animated boxes</button>
    @if (scriptedShown()) {
      <div class="m35-box" (animate.leave)="leaveWithClass($event)" data-testid="css-callback-box">
        CSS class
      </div>
    }
    @if (scriptedShown()) {
      <div
        class="m35-box"
        (animate.leave)="leaveWithScript($event)"
        data-testid="script-silent-box"
      >
        Script, no completion
      </div>
    }
    @if (scriptedShown()) {
      <div
        class="m35-box"
        (animate.leave)="leaveWithScriptAndComplete($event)"
        data-testid="script-done-box"
      >
        Script, completes
      </div>
    }

    <button type="button" (click)="cardShown.set(false)">Remove card</button>
    @if (cardShown()) {
      <section class="m35-card" data-testid="card">
        <p class="m35-line" animate.leave="m35-line-out" data-testid="card-line">Same template</p>
        @if (innerShown()) {
          <p class="m35-line" animate.leave="m35-line-out" data-testid="card-block-line">
            Inside an inner block
          </p>
        }
      </section>
    }

    <button type="button" (click)="childCardShown.set(false)">Remove child card</button>
    @if (childCardShown()) {
      <section class="m35-card" animate.leave="m35-card-out" data-testid="child-card">
        <lab-m35-callback-child data-testid="child-plain" />
        <lab-m35-callback-child animate.leave="m35-host-out" data-testid="child-with-host-leave" />
      </section>
    }

    <button type="button" (click)="createDynamic()">Create dynamic card</button>
    <button type="button" (click)="clearDynamic()">Clear dynamic cards</button>
    <ng-container #dynamicSlot />
  `,
  styles: `
    .m35-box,
    .m35-card {
      width: 12rem;
      padding: 1rem;
      margin-block: 1rem;
      background: #dbeafe;
    }

    .m35-cb-fade,
    .m35-line-out,
    .m35-card-out,
    .m35-host-out {
      animation: m35-callback-fade 1500ms forwards;
    }

    @keyframes m35-callback-fade {
      to {
        opacity: 0;
      }
    }
  `,
})
export class LabM35Callbacks {
  private readonly reads = inject(LabM35TimeoutReads);
  private readonly dynamicSlot = viewChild.required('dynamicSlot', { read: ViewContainerRef });
  private pendingComplete: VoidFunction | null = null;

  protected readonly manualShown = signal(true);
  protected readonly forgottenShown = signal(true);
  protected readonly scriptedShown = signal(true);
  protected readonly cardShown = signal(true);
  protected readonly innerShown = signal(true);
  protected readonly childCardShown = signal(true);
  protected readonly callbackTarget = signal('none');
  protected readonly timeoutReads = signal(0);

  /** Keeps the element: it leaves only when "Complete leave" calls animationComplete. */
  protected holdLeave(event: AnimationCallbackEvent): void {
    this.callbackTarget.set(event.target.getAttribute('data-testid') ?? 'unknown');
    this.pendingComplete = event.animationComplete;
  }

  protected completeLeave(): void {
    this.pendingComplete?.();
    this.pendingComplete = null;
  }

  /** Never calls animationComplete: only MAX_ANIMATION_TIMEOUT removes the element. */
  protected forgetLeave(event: AnimationCallbackEvent): void {
    event.target.setAttribute('data-leaving', 'true');
  }

  protected showTimeoutReads(): void {
    this.timeoutReads.set(this.reads.count);
  }

  /** Starts a CSS animation and never calls animationComplete. */
  protected leaveWithClass(event: AnimationCallbackEvent): void {
    event.target.classList.add('m35-cb-fade');
  }

  /** Starts a script animation and never calls animationComplete. */
  protected leaveWithScript(event: AnimationCallbackEvent): void {
    if (matchMedia(REDUCED_MOTION_QUERY).matches) return;
    event.target.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 1500, fill: 'forwards' });
  }

  /** Starts a script animation and calls animationComplete when its finished promise resolves. */
  protected leaveWithScriptAndComplete(event: AnimationCallbackEvent): void {
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

  protected createDynamic(): void {
    this.dynamicSlot().createComponent(LabM35DynamicCard);
  }

  protected clearDynamic(): void {
    this.dynamicSlot().clear();
  }
}
