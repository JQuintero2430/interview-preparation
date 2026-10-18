import { type AnimationCallbackEvent, Component, inject } from '@angular/core';
import { ToastStore } from '../toast-store';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const SLIDE = [
  { opacity: 0, transform: 'translateX(2rem)' },
  { opacity: 1, transform: 'none' },
];

// Exercise 35.1, variant b: functions. The code owns the motion with element.animate and tells Angular when it ends.
@Component({
  selector: 'lab-m35-toasts-b',
  template: `
    <h1>Exercise 35.1b: toasts with functions</h1>
    <button type="button" (click)="store.show('Saved')">Show toast</button>
    <ul aria-label="Toasts">
      @for (toast of store.toasts(); track toast.id) {
        <li
          class="m35-toast"
          (animate.enter)="enter($event)"
          (animate.leave)="leave($event)"
          [attr.data-toast]="toast.id"
        >
          {{ toast.text }} {{ toast.id }}
          <button type="button" (click)="store.dismiss(toast.id)">Dismiss {{ toast.id }}</button>
        </li>
      }
    </ul>
  `,
  styles: `
    .m35-toast {
      width: 14rem;
      padding: 0.5rem 1rem;
      margin-block: 0.5rem;
      background: #dbeafe;
    }
  `,
})
export class LabM35ToastsB {
  protected readonly store = inject(ToastStore);

  /** The marker class lasts as long as the animation, as animate.enter's class would. */
  protected enter(event: AnimationCallbackEvent): void {
    if (matchMedia(REDUCED_MOTION_QUERY).matches) return;
    event.target.classList.add('m35-toast-in');
    const run = event.target.animate(SLIDE, { duration: 800 });
    run.finished.then(
      () => event.target.classList.remove('m35-toast-in'),
      () => undefined,
    );
  }

  protected leave(event: AnimationCallbackEvent): void {
    if (matchMedia(REDUCED_MOTION_QUERY).matches) {
      event.animationComplete();
      return;
    }
    const run = event.target.animate([...SLIDE].reverse(), { duration: 800, fill: 'forwards' });
    run.finished.then(event.animationComplete, event.animationComplete);
  }
}
