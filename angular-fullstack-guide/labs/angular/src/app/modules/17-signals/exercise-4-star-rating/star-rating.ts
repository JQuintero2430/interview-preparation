// labs/angular/src/app/modules/17-signals/exercise-4-star-rating/star-rating.ts
import {
  booleanAttribute,
  Component,
  computed,
  input,
  model,
  numberAttribute,
} from '@angular/core';

@Component({
  selector: 'lab-star-rating',
  host: {
    role: 'group',
    '[attr.aria-label]': 'label()',
    '(keydown.arrowright)': 'step(1)',
    '(keydown.arrowleft)': 'step(-1)',
  },
  template: `
    @for (star of stars(); track star) {
      <button
        type="button"
        [attr.aria-label]="star + ' of ' + max()"
        [attr.aria-pressed]="star <= value()"
        [disabled]="readonly()"
        (click)="rate(star)"
      >
        {{ star <= value() ? '★' : '☆' }}
      </button>
    }
  `,
})
export class StarRating {
  /** Two-way bindable: the parent writes [(value)], this component writes value.set(). */
  readonly value = model(0);
  /** Transforms let plain HTML attributes work: <lab-star-rating max="10" readonly />. */
  readonly max = input(5, { transform: numberAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly label = input('Rating');

  readonly stars = computed(() => Array.from({ length: this.max() }, (_, i) => i + 1));

  rate(star: number): void {
    if (this.readonly()) return;
    this.value.set(star);
  }

  step(delta: number): void {
    this.rate(Math.min(this.max(), Math.max(0, this.value() + delta)));
  }
}
