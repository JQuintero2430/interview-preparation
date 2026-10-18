import {
  Component,
  ElementRef,
  ViewEncapsulation,
  input,
  linkedSignal,
  numberAttribute,
  output,
  viewChildren,
} from '@angular/core';

let created = 0;

/**
 * `<m37-ex2-rating-a max-stars="5">` and `<m37-ex2-rating-b …>`: a WAI-ARIA radio group of stars.
 * The host carries `data-instance`, the number of this component instance in the page (a creation counter),
 * so a test can tell a moved component from a re-created one.
 */
@Component({
  selector: 'lab-m37-ex2-rating',
  encapsulation: ViewEncapsulation.ShadowDom,
  host: { '[attr.data-instance]': 'instanceId' },
  template: `
    <div class="m37-rating" role="radiogroup" aria-label="Rating">
      @for (star of stars(); track star) {
        <button
          #star
          type="button"
          role="radio"
          class="m37-star"
          [class.m37-star-on]="star <= selected()"
          [attr.aria-checked]="star === selected()"
          [attr.aria-label]="star + ' of ' + maxStars() + ' stars'"
          [tabindex]="star === tabStop() ? 0 : -1"
          (click)="choose(star)"
          (keydown)="onKeydown($event, star)"
        >
          {{ star <= selected() ? '★' : '☆' }}
        </button>
      }
    </div>
  `,
  styles: `
    .m37-rating {
      display: inline-flex;
      gap: 0.25rem;
    }
    .m37-star {
      font-size: 1.5rem;
      background: none;
      border: 0;
      cursor: pointer;
    }
  `,
})
export class LabRating {
  readonly maxStars = input(5, { transform: (v: unknown) => numberAttribute(v, 5) });
  readonly value = input(0, { transform: (v: unknown) => numberAttribute(v, 0) });
  readonly ratingChange = output<number>();

  protected readonly instanceId = ++created;
  protected readonly selected = linkedSignal(() => this.value());
  protected readonly stars = () => Array.from({ length: Math.max(0, this.maxStars()) }, (_, i) => i + 1);
  /** Roving tabindex: the checked star is the tab stop, or the first star when none is checked. */
  protected readonly tabStop = () => (this.selected() >= 1 && this.selected() <= this.maxStars() ? this.selected() : 1);
  private readonly buttons = viewChildren<ElementRef<HTMLButtonElement>>('star');

  protected choose(star: number): void {
    this.selected.set(star);
    this.ratingChange.emit(star);
  }

  protected onKeydown(event: KeyboardEvent, star: number): void {
    const max = this.maxStars();
    let next: number;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = star === max ? 1 : star + 1;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        next = star === 1 ? max : star - 1;
        break;
      case ' ':
        next = star;
        break;
      default:
        return;
    }
    event.preventDefault();
    this.choose(next);
    // The tab stop moves with the selection; focus the new radio once its tabindex is rendered.
    queueMicrotask(() => this.buttons()[next - 1]?.nativeElement.focus());
  }
}
