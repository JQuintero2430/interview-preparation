import { Component, input, model, signal } from '@angular/core';

@Component({
  selector: 'lab-toggle-switch',
  template: `<ng-content />`,
  host: {
    role: 'switch',
    '[attr.aria-checked]': 'checked()',
    '[attr.aria-disabled]': 'disabled()',
    '[tabindex]': 'disabled() ? -1 : 0',
    '(click)': 'toggle()',
    '(keydown.space)': 'press($event)',
    '(keydown.enter)': 'press($event)',
    '(document:keydown.escape)': 'escapes.update((count) => count + 1)',
  },
})
export class ToggleSwitch {
  readonly checked = model(false);
  readonly disabled = input(false);
  // Counts Escape presses on the document; it exists to show that a host listener is removed on destroy.
  readonly escapes = signal(0);

  protected toggle(): void {
    if (!this.disabled()) {
      this.checked.update((value) => !value);
    }
  }

  protected press(event: Event): void {
    // Cancel the browser's default action for the key: a handled key should not also act natively.
    event.preventDefault();
    this.toggle();
  }
}
