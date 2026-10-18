import { Directive, ElementRef, Injector, Component, inject, input, model, viewChildren } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FocusKeyManager, type FocusableOption } from '@angular/cdk/a11y';

const STARS = [1, 2, 3, 4, 5];

@Directive({ selector: '[labM36Star]' })
class LabM36Star implements FocusableOption {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  focus(): void {
    this.host.nativeElement.focus();
  }
}

/** Variant b, the rewrite: ARIA radios in a `radiogroup`, arrow keys through a `FocusKeyManager`. Same selector, same inputs. */
@Component({
  selector: 'lab-m36-rating',
  imports: [LabM36Star],
  template: `
    <div role="radiogroup" [attr.aria-label]="label()" (keydown)="onKeydown($event)">
      @for (star of stars; track star) {
        <span
          labM36Star
          role="radio"
          [attr.aria-label]="'Rate ' + star"
          [attr.aria-checked]="value() === star"
          [attr.aria-disabled]="disabled()"
          [attr.tabindex]="tabIndexFor(star)"
          (click)="choose(star)"
        ></span>
      }
    </div>
  `,
})
export class LabM36Rating {
  readonly label = input.required<string>();
  readonly value = model(0);
  readonly disabled = input(false);

  protected readonly stars = STARS;
  private readonly items = viewChildren(LabM36Star);
  private readonly keys = new FocusKeyManager(this.items, inject(Injector)).withHorizontalOrientation('ltr');

  constructor() {
    this.keys.change.pipe(takeUntilDestroyed()).subscribe((index) => this.value.set(index + 1));
  }

  protected tabIndexFor(star: number): number {
    return !this.disabled() && star === (this.value() || 1) ? 0 : -1;
  }

  protected choose(star: number): void {
    if (!this.disabled()) {
      this.value.set(star);
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.disabled()) {
      return;
    }
    // The selection is the source of truth: tell the manager where it is, then let it move.
    this.keys.updateActiveItem(this.value() - 1);
    this.keys.onKeydown(event);
  }
}
