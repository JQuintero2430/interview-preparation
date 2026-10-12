import { Component, Directive, inject, input, signal } from '@angular/core';

// Records the order in which the classes below are constructed; the spec clears it before each test.
export const recorder: string[] = [];

@Directive({
  selector: '[labFocusRing]',
  host: {
    '[class.focus-ring]': 'focused()',
    '(focus)': 'focused.set(true)',
    '(blur)': 'focused.set(false)',
  },
})
export class FocusRing {
  protected readonly focused = signal(false);

  constructor() {
    recorder.push('focus-ring');
  }
}

@Directive({
  selector: '[labHint]',
  host: { '[attr.title]': 'text()' },
})
export class Hint {
  // `null` removes the attribute, so an unset hint leaves no title behind.
  readonly text = input<string | null>(null);

  constructor() {
    recorder.push('hint');
  }
}

@Component({
  selector: 'lab-menu-button',
  template: '<ng-content />',
  // Only `text` is exposed, and under the public name `hint`; the focus ring has nothing to expose.
  hostDirectives: [FocusRing, { directive: Hint, inputs: ['text: hint'] }],
  host: { role: 'button', tabindex: '0' },
})
export class MenuButton {
  readonly hint = inject(Hint);

  constructor() {
    recorder.push('menu-button');
  }
}
