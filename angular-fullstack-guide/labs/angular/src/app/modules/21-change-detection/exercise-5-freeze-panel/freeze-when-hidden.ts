import { ChangeDetectorRef, Directive, effect, inject, input } from '@angular/core';

// Put on a component's host element: its injected ChangeDetectorRef is the component's own view.
@Directive({ selector: '[labM21E5Freeze]' })
export class FreezeWhenHidden {
  readonly frozen = input(false, { alias: 'labM21E5Freeze' });
  private readonly cdr = inject(ChangeDetectorRef);
  private detached = false;

  constructor() {
    effect(() => {
      const frozen = this.frozen();
      if (frozen === this.detached) {
        return;
      }
      this.detached = frozen;
      if (frozen) {
        this.cdr.detach();
      } else {
        this.cdr.reattach();
      }
    });
  }

  refresh(): void {
    this.cdr.detectChanges();
  }
}
