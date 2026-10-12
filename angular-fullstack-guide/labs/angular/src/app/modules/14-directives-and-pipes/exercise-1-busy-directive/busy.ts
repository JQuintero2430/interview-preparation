import { booleanAttribute, computed, Directive, input, output } from '@angular/core';

@Directive({
  selector: '[labBusy]',
  exportAs: 'labBusy',
  host: {
    '[attr.aria-busy]': 'isBusy() ? "true" : null',
    '[class.is-busy]': 'isBusy()',
    '[attr.disabled]': 'isBusy() ? "" : null',
    '(click)': 'onClick($event)',
  },
})
export class Busy {
  // A bare `labBusy` attribute arrives as '', which booleanAttribute turns into true.
  readonly labBusy = input(false, { transform: booleanAttribute });
  readonly activated = output<void>();
  readonly isBusy = computed(() => this.labBusy());

  protected onClick(event: Event): void {
    if (this.isBusy()) {
      // Stops the other listeners on this element and the event's trip up to the ancestors; a child already ran.
      event.stopImmediatePropagation();
      return;
    }
    this.activated.emit();
  }
}
