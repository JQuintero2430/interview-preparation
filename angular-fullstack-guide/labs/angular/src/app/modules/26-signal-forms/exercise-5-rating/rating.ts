import { Component, computed, input, model, output } from '@angular/core';
import type { FormValueControl, ValidationError } from '@angular/forms/signals';

const DEFAULT_STARS = 5;

@Component({
  selector: 'lab-m26-rating',
  template: `
    <div class="stars" role="group" (keydown)="onKey($event)">
      @for (star of stars(); track star) {
        <button
          type="button"
          class="star"
          [class.on]="star <= value()"
          [disabled]="disabled()"
          (click)="value.set(star)"
          (blur)="touch.emit()"
        >
          {{ star }}
        </button>
      }
    </div>
    @for (e of errors(); track e.kind) {
      <p class="rating-error">{{ e.kind }}</p>
    }
  `,
})
export class LabM26Rating implements FormValueControl<number> {
  readonly value = model(0);
  readonly disabled = input(false);
  readonly errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);
  readonly max = input<number | undefined>(undefined);
  readonly touch = output<void>();

  protected readonly stars = computed(() =>
    Array.from({ length: this.max() ?? DEFAULT_STARS }, (_, i) => i + 1),
  );

  protected onKey(event: KeyboardEvent): void {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    const next = this.value() + step;
    if (step !== 0 && !this.disabled() && next >= 0 && next <= this.stars().length) {
      this.value.set(next);
    }
  }
}
