import { Component, inject } from '@angular/core';
import { ToastStore } from '../toast-store';

// Exercise 35.1, variant a: classes. The CSS owns the motion; Angular adds and removes the classes.
@Component({
  selector: 'lab-m35-toasts-a',
  template: `
    <h1>Exercise 35.1a: toasts with classes</h1>
    <button type="button" (click)="store.show('Saved')">Show toast</button>
    <ul aria-label="Toasts">
      @for (toast of store.toasts(); track toast.id) {
        <li
          class="m35-toast"
          animate.enter="m35-toast-in"
          animate.leave="m35-toast-out"
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

    .m35-toast-in {
      animation: m35-toast-slide-in 800ms;
    }

    .m35-toast-out {
      animation: m35-toast-slide-out 800ms forwards;
    }

    @keyframes m35-toast-slide-in {
      from {
        opacity: 0;
        transform: translateX(2rem);
      }
    }

    @keyframes m35-toast-slide-out {
      to {
        opacity: 0;
        transform: translateX(2rem);
      }
    }
  `,
})
export class LabM35ToastsA {
  protected readonly store = inject(ToastStore);
}
