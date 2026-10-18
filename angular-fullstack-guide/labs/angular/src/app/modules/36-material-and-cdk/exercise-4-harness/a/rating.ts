import { Component, ElementRef, input, model, viewChildren } from '@angular/core';

const STEP_BY_KEY: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
const STARS = [1, 2, 3, 4, 5];
let nextGroup = 0;

/** Variant a: native radio inputs in a `fieldset` with a `legend`; the component adds the arrow keys itself. */
@Component({
  selector: 'lab-m36-rating',
  template: `
    <fieldset (keydown)="onKeydown($event)">
      <legend>{{ label() }}</legend>
      @for (star of stars; track star) {
        <input
          #radio
          type="radio"
          [name]="group"
          [attr.aria-label]="'Rate ' + star"
          [checked]="value() === star"
          [disabled]="disabled()"
          (change)="value.set(star)"
        />
      }
    </fieldset>
  `,
})
export class LabM36Rating {
  readonly label = input.required<string>();
  readonly value = model(0);
  readonly disabled = input(false);

  protected readonly stars = STARS;
  protected readonly group = `lab-m36-rating-${nextGroup++}`;
  private readonly radios = viewChildren<ElementRef<HTMLInputElement>>('radio');

  protected onKeydown(event: KeyboardEvent): void {
    const step = STEP_BY_KEY[event.key];
    if (step === undefined || this.disabled()) {
      return;
    }
    event.preventDefault();
    const next = Math.min(Math.max(this.value() + step, 1), this.stars.length);
    this.value.set(next);
    this.radios()[next - 1]?.nativeElement.focus();
  }
}
