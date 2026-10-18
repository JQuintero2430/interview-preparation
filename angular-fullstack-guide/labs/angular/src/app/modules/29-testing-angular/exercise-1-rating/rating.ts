import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'lab-m29-rating',
  template: `
    @for (point of points(); track point) {
      <button
        type="button"
        [attr.aria-pressed]="point <= value()"
        [attr.aria-label]="'Rate ' + point + ' of ' + max()"
        [disabled]="readonly()"
        (click)="rated.emit(point)"
      >
        ★
      </button>
    }
  `,
})
export class LabM29Rating {
  readonly value = input.required<number>();
  readonly max = input(5);
  readonly readonly = input(false);
  readonly rated = output<number>();

  protected readonly points = computed(() =>
    Array.from({ length: this.max() }, (_, index) => index + 1),
  );
}
